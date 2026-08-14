import { describe, expect, it } from "vitest";

import {
  formatPlanPriceLine,
  getPlanDefinition,
  PLAN_SLUGS,
  resolvePlanSlug,
} from "./plans";

describe("plans", () => {
  it("expõe preços e limites MVP", () => {
    expect(getPlanDefinition(PLAN_SLUGS.essential).priceMonthlyBrl).toBe(39);
    expect(getPlanDefinition(PLAN_SLUGS.essential).maxMembersWithLogin).toBe(3);
    expect(getPlanDefinition(PLAN_SLUGS.essential).hasVoice).toBe(false);
    expect(getPlanDefinition(PLAN_SLUGS.cuidado_plus).priceMonthlyBrl).toBe(69);
    expect(getPlanDefinition(PLAN_SLUGS.cuidado_plus).maxMembersWithLogin).toBe(
      null,
    );
    expect(getPlanDefinition(PLAN_SLUGS.cuidado_plus).hasAdvancedLocation).toBe(
      true,
    );
  });

  it("formata linha de preço", () => {
    expect(formatPlanPriceLine(PLAN_SLUGS.essential)).toBe(
      "Essencial · R$ 39/mês",
    );
    expect(formatPlanPriceLine(PLAN_SLUGS.cuidado_plus)).toBe(
      "Cuidado+ · R$ 69/mês",
    );
  });

  it("rejeita slug desconhecido com fallback Essencial", () => {
    expect(resolvePlanSlug("familia")).toEqual({
      slug: PLAN_SLUGS.essential,
      isUnknown: true,
    });
    expect(resolvePlanSlug(null)).toEqual({
      slug: PLAN_SLUGS.essential,
      isUnknown: false,
    });
  });
});
