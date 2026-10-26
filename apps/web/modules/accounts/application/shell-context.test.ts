import { describe, expect, it } from "vitest";

import { ACCOUNT_STATUSES } from "@/modules/accounts/domain/roles";

import {
  computeTrialDisplay,
  formatRecipientAgeLine,
  isTrialActive,
  resolveFamilyAccessNotice,
  resolveTrialTotalDays,
} from "./shell-context";

describe("resolveTrialTotalDays", () => {
  it("usa 30 dias para essential e 60 para cuidado_plus", () => {
    expect(resolveTrialTotalDays("essential")).toBe(30);
    expect(resolveTrialTotalDays("cuidado_plus")).toBe(60);
    expect(resolveTrialTotalDays(null)).toBe(30);
  });
});

describe("isTrialActive", () => {
  it("retorna true quando fim está no futuro", () => {
    expect(
      isTrialActive("2026-09-12T00:00:00.000Z", new Date("2026-08-12")),
    ).toBe(true);
  });

  it("retorna false quando fim passou ou é nulo", () => {
    expect(
      isTrialActive("2026-07-01T00:00:00.000Z", new Date("2026-08-12")),
    ).toBe(false);
    expect(isTrialActive(null)).toBe(false);
  });
});

describe("computeTrialDisplay", () => {
  it("mostra dia 1 no primeiro dia de trial de 30 dias", () => {
    const now = new Date("2026-08-12T12:00:00.000Z");
    const trialEndsAt = new Date("2026-09-11T12:00:00.000Z").toISOString();

    expect(
      computeTrialDisplay({
        trialEndsAt,
        plan: "essential",
        now,
      }),
    ).toEqual({ currentDay: 1, totalDays: 30 });
  });

  it("retorna null quando trial encerrou", () => {
    expect(
      computeTrialDisplay({
        trialEndsAt: "2026-01-01T00:00:00.000Z",
        plan: "essential",
        now: new Date("2026-08-12"),
      }),
    ).toBeNull();
  });

  it("usa 60 dias para cuidado_plus", () => {
    const now = new Date("2026-08-12T12:00:00.000Z");
    const trialEndsAt = new Date("2026-10-11T12:00:00.000Z").toISOString();

    expect(
      computeTrialDisplay({
        trialEndsAt,
        plan: "cuidado_plus",
        now,
      }),
    ).toEqual({ currentDay: 1, totalDays: 60 });
  });
});

describe("formatRecipientAgeLine", () => {
  it("formata idade ou copy neutra", () => {
    expect(
      formatRecipientAgeLine({ age: 78, ageUnknownCopy: "idade não informada" }),
    ).toBe("78 anos");
    expect(
      formatRecipientAgeLine({ age: null, ageUnknownCopy: "idade não informada" }),
    ).toBe("idade não informada");
  });
});

describe("resolveFamilyAccessNotice", () => {
  const now = new Date("2026-10-21T15:00:00.000Z");

  it("fica calmo quando faltam mais de 5 dias", () => {
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.active,
        trialEndsAt: "2026-10-27T15:00:00.000Z",
        now,
      }).phase,
    ).toBe("calm");
  });

  it("avisa nos últimos 5 dias, no dia do fim e se o trial já venceu sem pausar", () => {
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.active,
        trialEndsAt: "2026-10-26T15:00:00.000Z",
        now,
      }).phase,
    ).toBe("ending");
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.active,
        trialEndsAt: "2026-10-21T15:00:00.000Z",
        now,
      }).phase,
    ).toBe("ending");
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.active,
        trialEndsAt: "2026-10-20T15:00:00.000Z",
        now,
      }),
    ).toMatchObject({ phase: "ending", endsAtLabel: "20/10/2026" });
  });

  it("mostra pausa mesmo com data antiga e distingue cancelamento", () => {
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.paused,
        trialEndsAt: "2026-10-20T15:00:00.000Z",
        now,
      }),
    ).toEqual({
      phase: "paused",
      endsAtLabel: "20/10/2026",
      isCanceled: false,
    });
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.canceled,
        trialEndsAt: null,
        now,
      }),
    ).toEqual({
      phase: "paused",
      endsAtLabel: null,
      isCanceled: true,
    });
  });

  it("esconde o aviso quando não há trial", () => {
    expect(
      resolveFamilyAccessNotice({
        accountStatus: ACCOUNT_STATUSES.active,
        trialEndsAt: null,
        now,
      }).phase,
    ).toBe("hidden");
  });
});
