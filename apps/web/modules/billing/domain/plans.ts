/** Slugs de plano MVP — lista fechada (A03). */
export const PLAN_SLUGS = {
  essential: "essential",
  cuidado_plus: "cuidado_plus",
} as const;

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS];

export interface PlanDefinition {
  slug: PlanSlug;
  displayName: string;
  priceMonthlyBrl: number;
  storageQuotaBytes: number;
  maxMembersWithLogin: number | null;
  hasVoice: boolean;
  hasAdvancedLocation: boolean;
}

export const PLAN_DEFINITIONS: Record<PlanSlug, PlanDefinition> = {
  [PLAN_SLUGS.essential]: {
    slug: PLAN_SLUGS.essential,
    displayName: "Essencial",
    priceMonthlyBrl: 39,
    storageQuotaBytes: 2 * 1024 * 1024 * 1024,
    maxMembersWithLogin: 3,
    hasVoice: false,
    hasAdvancedLocation: false,
  },
  [PLAN_SLUGS.cuidado_plus]: {
    slug: PLAN_SLUGS.cuidado_plus,
    displayName: "Cuidado+",
    priceMonthlyBrl: 69,
    storageQuotaBytes: 20 * 1024 * 1024 * 1024,
    maxMembersWithLogin: null,
    hasVoice: true,
    hasAdvancedLocation: true,
  },
};

const KNOWN_PLAN_SLUGS = new Set<string>(Object.values(PLAN_SLUGS));

/** Normaliza slug desconhecido para Essencial (fallback seguro). */
export function resolvePlanSlug(raw: string | null | undefined): {
  slug: PlanSlug;
  isUnknown: boolean;
} {
  if (raw === PLAN_SLUGS.cuidado_plus) {
    return { slug: PLAN_SLUGS.cuidado_plus, isUnknown: false };
  }
  if (raw === PLAN_SLUGS.essential) {
    return { slug: PLAN_SLUGS.essential, isUnknown: false };
  }
  const isUnknown = Boolean(raw && !KNOWN_PLAN_SLUGS.has(raw));
  return { slug: PLAN_SLUGS.essential, isUnknown };
}

export function getPlanDefinition(slug: PlanSlug): PlanDefinition {
  return PLAN_DEFINITIONS[slug];
}

export function formatPlanPriceLine(slug: PlanSlug): string {
  const plan = getPlanDefinition(slug);
  return `${plan.displayName} · R$ ${plan.priceMonthlyBrl}/mês`;
}
