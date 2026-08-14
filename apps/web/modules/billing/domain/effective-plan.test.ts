import { describe, expect, it } from "vitest";

import { PLAN_SLUGS } from "./plans";
import {
  hasAdvancedLocation,
  hasVoiceFeature,
  resolveEffectivePlan,
  resolveStorageQuotaBytes,
} from "./effective-plan";

describe("effective-plan", () => {
  it("trial Essencial mantém cota de 2 GB", () => {
    expect(resolveStorageQuotaBytes("essential")).toBe(2 * 1024 * 1024 * 1024);
    expect(resolveEffectivePlan("essential").storageQuotaBytes).toBe(
      2 * 1024 * 1024 * 1024,
    );
  });

  it("Cuidado+ mantém cota de 20 GB", () => {
    expect(resolveStorageQuotaBytes("cuidado_plus")).toBe(
      20 * 1024 * 1024 * 1024,
    );
  });

  it("expõe gates de voz e localização", () => {
    expect(hasVoiceFeature("essential")).toBe(false);
    expect(hasVoiceFeature("cuidado_plus")).toBe(true);
    expect(hasAdvancedLocation("essential")).toBe(false);
    expect(hasAdvancedLocation("cuidado_plus")).toBe(true);
  });

  it("fallback desconhecido usa Essencial", () => {
    const effective = resolveEffectivePlan("typo");
    expect(effective.slug).toBe(PLAN_SLUGS.essential);
    expect(effective.isUnknownPlan).toBe(true);
  });
});
