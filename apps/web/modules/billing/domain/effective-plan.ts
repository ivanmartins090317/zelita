import {
  getPlanDefinition,
  resolvePlanSlug,
  type PlanSlug,
} from "./plans";

export interface EffectivePlan {
  slug: PlanSlug;
  storageQuotaBytes: number;
  maxMembersWithLogin: number | null;
  hasVoice: boolean;
  hasAdvancedLocation: boolean;
  isUnknownPlan: boolean;
}

/** Limites seguem o plano escolhido no cadastro — trial não promove a Cuidado+. */
export function resolveEffectivePlan(
  accountPlan: string | null | undefined,
): EffectivePlan {
  const { slug, isUnknown } = resolvePlanSlug(accountPlan);
  const definition = getPlanDefinition(slug);

  return {
    slug,
    storageQuotaBytes: definition.storageQuotaBytes,
    maxMembersWithLogin: definition.maxMembersWithLogin,
    hasVoice: definition.hasVoice,
    hasAdvancedLocation: definition.hasAdvancedLocation,
    isUnknownPlan: isUnknown,
  };
}

export function resolveStorageQuotaBytes(
  accountPlan: string | null | undefined,
): number {
  return resolveEffectivePlan(accountPlan).storageQuotaBytes;
}

export function hasAdvancedLocation(
  accountPlan: string | null | undefined,
): boolean {
  return resolveEffectivePlan(accountPlan).hasAdvancedLocation;
}

export function hasVoiceFeature(
  accountPlan: string | null | undefined,
): boolean {
  return resolveEffectivePlan(accountPlan).hasVoice;
}
