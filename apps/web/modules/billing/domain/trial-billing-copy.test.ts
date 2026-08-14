import { describe, expect, it } from "vitest";

import { ACCOUNT_STATUSES } from "@/modules/accounts/domain/roles";

import { PLAN_SLUGS } from "./plans";
import {
  computeTrialBillingCopy,
  resolvePlanStatusTagKind,
} from "./trial-billing-copy";

describe("trial-billing-copy", () => {
  it("trial Essencial — dia 1 de 30 e datas de cobrança", () => {
    const now = new Date("2026-08-12T12:00:00.000Z");
    const trialEndsAt = new Date("2026-09-11T12:00:00.000Z").toISOString();

    const copy = computeTrialBillingCopy({
      trialEndsAt,
      plan: "essential",
      accountStatus: ACCOUNT_STATUSES.active,
      planSlug: PLAN_SLUGS.essential,
      now,
    });

    expect(copy.isTrialActive).toBe(true);
    expect(copy.trialDisplay).toEqual({ currentDay: 1, totalDays: 30 });
    expect(copy.remainingDays).toBeGreaterThan(0);
    expect(copy.statusTagKind).toBe("trial");
    expect(copy.planPriceLine).toBe("Essencial · R$ 39/mês");
    expect(copy.firstChargeDateLabel).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(copy.warningDateLabel).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("trial Cuidado+ — 60 dias", () => {
    const now = new Date("2026-08-12T12:00:00.000Z");
    const trialEndsAt = new Date("2026-10-11T12:00:00.000Z").toISOString();

    const copy = computeTrialBillingCopy({
      trialEndsAt,
      plan: "cuidado_plus",
      accountStatus: ACCOUNT_STATUSES.active,
      planSlug: PLAN_SLUGS.cuidado_plus,
      now,
    });

    expect(copy.trialDisplay?.totalDays).toBe(60);
    expect(copy.planPriceLine).toBe("Cuidado+ · R$ 69/mês");
  });

  it("pós-trial ativo — sem faixa", () => {
    const copy = computeTrialBillingCopy({
      trialEndsAt: "2026-01-01T00:00:00.000Z",
      plan: "essential",
      accountStatus: ACCOUNT_STATUSES.active,
      planSlug: PLAN_SLUGS.essential,
      now: new Date("2026-08-12"),
    });

    expect(copy.isTrialActive).toBe(false);
    expect(copy.trialDisplay).toBeNull();
    expect(copy.statusTagKind).toBe("active");
    expect(copy.firstChargeDateLabel).toBeNull();
  });

  it("conta pausada", () => {
    expect(
      resolvePlanStatusTagKind({
        accountStatus: ACCOUNT_STATUSES.paused,
        isTrialActive: false,
      }),
    ).toBe("paused");
  });
});
