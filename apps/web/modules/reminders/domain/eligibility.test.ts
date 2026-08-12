import { describe, expect, it } from "vitest";

import {
  assertSafeReminderLanguage,
  decideReminderSend,
  isInsideDnd,
  REMINDER_DECISIONS,
  reminderSentCopy,
} from "./eligibility";

describe("isInsideDnd", () => {
  it("detecta janela no mesmo dia", () => {
    const at = new Date("2026-08-12T10:00:00.000Z");
    expect(isInsideDnd(at, { start: "09:00", end: "11:00" })).toBe(true);
    expect(isInsideDnd(at, { start: "11:00", end: "12:00" })).toBe(false);
  });

  it("detecta janela que atravessa meia-noite", () => {
    const night = new Date("2026-08-12T23:30:00.000Z");
    const morning = new Date("2026-08-12T06:00:00.000Z");
    const noon = new Date("2026-08-12T12:00:00.000Z");
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
    scheduledAt: new Date("2026-08-12T15:00:00.000Z"),
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
    expect(decideReminderSend({ ...base, accountPaused: true })).toBe(
      REMINDER_DECISIONS.skip_account_paused,
    );
  });

  it("adia dentro do DND", () => {
    expect(
      decideReminderSend({
        ...base,
        scheduledAt: new Date("2026-08-12T23:00:00.000Z"),
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
