import { describe, expect, it } from "vitest";

import {
  assertSafeReminderLanguage,
  decideReminderSend,
  isInsideDnd,
  REMINDER_DECISIONS,
  reminderSentCopy,
} from "./eligibility";
import { CARE_TIMEZONE } from "./zoned-time";

describe("isInsideDnd", () => {
  it("detecta janela no mesmo dia em Brasília", () => {
    const at = new Date("2026-08-12T13:00:00.000-03:00");
    expect(isInsideDnd(at, { start: "12:00", end: "14:00" })).toBe(true);
    expect(isInsideDnd(at, { start: "14:00", end: "15:00" })).toBe(false);
  });

  it("não usa UTC cru (08:00 BRT ≠ 08:00 UTC)", () => {
    const eightUtc = new Date("2026-08-12T08:00:00.000Z");
    expect(
      isInsideDnd(eightUtc, { start: "08:00", end: "09:00" }, CARE_TIMEZONE),
    ).toBe(false);
    const eightBrt = new Date("2026-08-12T08:00:00.000-03:00");
    expect(
      isInsideDnd(eightBrt, { start: "08:00", end: "09:00" }, CARE_TIMEZONE),
    ).toBe(true);
  });

  it("detecta janela que atravessa meia-noite", () => {
    const night = new Date("2026-08-12T23:30:00.000-03:00");
    const morning = new Date("2026-08-13T06:00:00.000-03:00");
    const noon = new Date("2026-08-13T12:00:00.000-03:00");
    const dnd = { start: "22:00", end: "07:00" };
    expect(isInsideDnd(night, dnd)).toBe(true);
    expect(isInsideDnd(morning, dnd)).toBe(true);
    expect(isInsideDnd(noon, dnd)).toBe(false);
  });
});

describe("decideReminderSend", () => {
  const base = {
    hasWhatsAppOptIn: true,
    accountPaused: false,
    scheduledAt: new Date("2026-08-12T15:00:00.000-03:00"),
    dnd: { start: "22:00", end: "07:00" },
  };

  it("envia com opt-in, conta ativa e fora do DND", () => {
    expect(decideReminderSend(base)).toBe(REMINDER_DECISIONS.send);
  });

  it("pula sem opt-in", () => {
    expect(
      decideReminderSend({ ...base, hasWhatsAppOptIn: false }),
    ).toBe(REMINDER_DECISIONS.skip_no_opt_in);
  });

  it("pula conta pausada", () => {
    expect(
      decideReminderSend({ ...base, accountPaused: true }),
    ).toBe(REMINDER_DECISIONS.skip_account_paused);
  });

  it("adia dentro do DND em Brasília", () => {
    expect(
      decideReminderSend({
        ...base,
        scheduledAt: new Date("2026-08-12T23:00:00.000-03:00"),
      }),
    ).toBe(REMINDER_DECISIONS.defer_dnd);
  });
});

describe("linguagem lembrete ≠ tomada", () => {
  it("gera copy segura", () => {
    const text = reminderSentCopy("seu João", "Losartana 50 mg");
    expect(text).toMatch(/Está na hora/);
    expect(() => assertSafeReminderLanguage(text)).not.toThrow();
  });

  it("rejeita afirmação de tomada", () => {
    expect(() =>
      assertSafeReminderLanguage("O idoso tomou o medicamento"),
    ).toThrow(/lembrete enviado/);
  });
});
