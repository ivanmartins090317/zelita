import { describe, expect, it } from "vitest";

import { ACCOUNT_STATUSES } from "@/modules/accounts/domain/roles";

import {
  shouldPauseUnpaidTrial,
  shouldSendTrialEndingWarning,
} from "./trial-jobs";

describe("shouldSendTrialEndingWarning", () => {
  it("avisa exatamente 5 dias civis antes", () => {
    const end = new Date("2026-10-16T18:00:00.000-03:00");
    const now = new Date("2026-10-11T09:00:00.000-03:00");
    expect(shouldSendTrialEndingWarning(end, now)).toBe(true);
    expect(
      shouldSendTrialEndingWarning(end, new Date("2026-10-12T09:00:00.000-03:00")),
    ).toBe(false);
  });
});

describe("shouldPauseUnpaidTrial", () => {
  const ended = new Date("2026-09-20T12:00:00.000-03:00");
  const now = new Date("2026-09-21T09:00:00.000-03:00");

  it("pausa trial vencido sem plano pago", () => {
    expect(
      shouldPauseUnpaidTrial({
        trialEndsAt: ended,
        accountStatus: ACCOUNT_STATUSES.active,
        hasPaidPlan: false,
        now,
      }),
    ).toBe(true);
  });

  it("não pausa se já pagou ou já está pausada", () => {
    expect(
      shouldPauseUnpaidTrial({
        trialEndsAt: ended,
        accountStatus: ACCOUNT_STATUSES.active,
        hasPaidPlan: true,
        now,
      }),
    ).toBe(false);
    expect(
      shouldPauseUnpaidTrial({
        trialEndsAt: ended,
        accountStatus: ACCOUNT_STATUSES.paused,
        hasPaidPlan: false,
        now,
      }),
    ).toBe(false);
  });

  it("não cobra e não pausa trial ainda vigente", () => {
    expect(
      shouldPauseUnpaidTrial({
        trialEndsAt: new Date("2026-10-01T12:00:00.000-03:00"),
        accountStatus: ACCOUNT_STATUSES.active,
        hasPaidPlan: false,
        now,
      }),
    ).toBe(false);
  });
});
