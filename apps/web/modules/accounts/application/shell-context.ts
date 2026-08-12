import type { AccountStatus } from "@/modules/accounts/domain/roles";
import type { AccountRole } from "@/modules/accounts/domain/roles";

export interface TrialDisplay {
  currentDay: number;
  totalDays: number;
}

export interface ShellMembershipOption {
  accountId: string;
  displayName: string;
  subtitle: string;
  initials: string;
  isSelected: boolean;
}

export interface ShellContext {
  userId: string;
  profileName: string | null;
  profileInitials: string;
  accountId: string;
  role: AccountRole;
  accountStatus: AccountStatus;
  accountPlan: string;
  careRecipientId: string;
  careRecipientDisplayName: string;
  careRecipientBirthDate: string | null;
  careRecipientInitials: string;
  careRecipientAge: number | null;
  careRecipientRelationship: string | null;
  canManageMedications: boolean;
  trial: TrialDisplay | null;
  isPaused: boolean;
  memberships: ShellMembershipOption[];
}

const TRIAL_DAYS_BY_PLAN: Record<string, number> = {
  essential: 30,
  cuidado_plus: 60,
};

/** Total de dias do trial conforme plano da conta. */
export function resolveTrialTotalDays(plan: string | null | undefined): number {
  if (!plan) return TRIAL_DAYS_BY_PLAN.essential;
  return TRIAL_DAYS_BY_PLAN[plan] ?? TRIAL_DAYS_BY_PLAN.essential;
}

/** Trial ativo quando a data de fim está no futuro. */
export function isTrialActive(
  trialEndsAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!trialEndsAt) return false;
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return false;
  return end.getTime() > now.getTime();
}

/** Calcula "Dia X de Y" a partir do fim do trial e duração do plano. */
export function computeTrialDisplay(input: {
  trialEndsAt: string | null | undefined;
  plan: string | null | undefined;
  now?: Date;
}): TrialDisplay | null {
  const now = input.now ?? new Date();
  if (!isTrialActive(input.trialEndsAt, now)) return null;

  const totalDays = resolveTrialTotalDays(input.plan);
  const end = new Date(input.trialEndsAt as string);
  const startMs = end.getTime() - totalDays * 24 * 60 * 60 * 1000;
  const elapsedDays = Math.floor((now.getTime() - startMs) / (24 * 60 * 60 * 1000));
  const currentDay = Math.min(Math.max(elapsedDays + 1, 1), totalDays);

  return { currentDay, totalDays };
}

/** Linha de idade para o seletor da sidebar. */
export function formatRecipientAgeLine(input: {
  age: number | null;
  ageUnknownCopy: string;
}): string {
  if (input.age != null) return `${input.age} anos`;
  return input.ageUnknownCopy;
}
