import {
  ACCOUNT_STATUSES,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import { calendarDaysUntil } from "@/modules/reminders";

export const TRIAL_WARNING_DAYS = 5;

export function shouldSendTrialEndingWarning(
  trialEndsAt: Date,
  now: Date,
): boolean {
  return calendarDaysUntil(trialEndsAt, now) === TRIAL_WARNING_DAYS;
}

export function shouldPauseUnpaidTrial(input: {
  trialEndsAt: Date | null;
  accountStatus: AccountStatus;
  hasPaidPlan: boolean;
  now: Date;
}): boolean {
  if (input.hasPaidPlan) return false;
  if (input.accountStatus !== ACCOUNT_STATUSES.active) return false;
  if (!input.trialEndsAt) return false;
  return input.trialEndsAt.getTime() <= input.now.getTime();
}
