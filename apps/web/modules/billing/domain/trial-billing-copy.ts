import type { AccountStatus } from "@/modules/accounts/domain/roles";
import { ACCOUNT_STATUSES } from "@/modules/accounts/domain/roles";
import {
  computeTrialDisplay,
  isTrialActive,
  type TrialDisplay,
} from "@/modules/accounts/application/shell-context";

import { formatPlanPriceLine, type PlanSlug } from "./plans";

export type PlanStatusTagKind = "trial" | "active" | "paused" | "canceled";

export interface TrialBillingCopyInput {
  trialEndsAt: string | null | undefined;
  plan: string | null | undefined;
  accountStatus: AccountStatus;
  now?: Date;
}

export interface TrialBillingCopy {
  isTrialActive: boolean;
  trialDisplay: TrialDisplay | null;
  remainingDays: number;
  statusTagKind: PlanStatusTagKind;
  planPriceLine: string;
  planSlug: PlanSlug;
  firstChargeDateLabel: string | null;
  warningDateLabel: string | null;
}

const TRIAL_WARNING_DAYS = 5;

function formatDatePtBr(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

function computeRemainingDays(trialEndsAt: string, now: Date): number {
  const end = new Date(trialEndsAt);
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

function subtractDaysFromIso(iso: string, days: number): Date {
  const date = new Date(iso);
  date.setDate(date.getDate() - days);
  return date;
}

export function resolvePlanStatusTagKind(input: {
  accountStatus: AccountStatus;
  isTrialActive: boolean;
}): PlanStatusTagKind {
  if (input.accountStatus === ACCOUNT_STATUSES.canceled) return "canceled";
  if (input.accountStatus === ACCOUNT_STATUSES.paused) return "paused";
  if (input.isTrialActive) return "trial";
  return "active";
}

export function computeTrialBillingCopy(
  input: TrialBillingCopyInput & { planSlug: PlanSlug },
): TrialBillingCopy {
  const now = input.now ?? new Date();
  const trialActive = isTrialActive(input.trialEndsAt, now);
  const trialDisplay = trialActive
    ? computeTrialDisplay({
        trialEndsAt: input.trialEndsAt,
        plan: input.plan,
        now,
      })
    : null;

  let firstChargeDateLabel: string | null = null;
  let warningDateLabel: string | null = null;

  if (trialActive && input.trialEndsAt) {
    firstChargeDateLabel = formatDatePtBr(new Date(input.trialEndsAt));
    warningDateLabel = formatDatePtBr(
      subtractDaysFromIso(input.trialEndsAt, TRIAL_WARNING_DAYS),
    );
  }

  return {
    isTrialActive: trialActive,
    trialDisplay,
    remainingDays: input.trialEndsAt
      ? computeRemainingDays(input.trialEndsAt, now)
      : 0,
    statusTagKind: resolvePlanStatusTagKind({
      accountStatus: input.accountStatus,
      isTrialActive: trialActive,
    }),
    planPriceLine: formatPlanPriceLine(input.planSlug),
    planSlug: input.planSlug,
    firstChargeDateLabel,
    warningDateLabel,
  };
}
