export const REFILL_ALERT_KINDS = {
  none: "none",
  warning: "warning",
  eve: "eve",
  lastDay: "last_day",
} as const;

export type RefillAlertKind =
  (typeof REFILL_ALERT_KINDS)[keyof typeof REFILL_ALERT_KINDS];

export const REFILL_EVENT_TYPES = {
  warning: "pack_refill_warning",
  lastDay: "pack_last_day",
} as const;

export function classifyRefillAlert(
  daysRemaining: number,
  refillAlertDays: number,
): RefillAlertKind {
  if (daysRemaining <= 0) return REFILL_ALERT_KINDS.lastDay;
  if (daysRemaining === 1) return REFILL_ALERT_KINDS.eve;
  if (daysRemaining <= refillAlertDays) return REFILL_ALERT_KINDS.warning;
  return REFILL_ALERT_KINDS.none;
}

export function refillEventType(kind: RefillAlertKind): string | null {
  if (kind === REFILL_ALERT_KINDS.none) return null;
  if (kind === REFILL_ALERT_KINDS.lastDay) return REFILL_EVENT_TYPES.lastDay;
  return REFILL_EVENT_TYPES.warning;
}
