/** Status de um pedido de ajuda — sem enum TS. */
export const SOS_ALERT_STATUS = {
  open: "open",
  resolved: "resolved",
  cancelled: "cancelled",
} as const;

export type SosAlertStatus =
  (typeof SOS_ALERT_STATUS)[keyof typeof SOS_ALERT_STATUS];

export const SOS_ALERT_STATUS_LABELS: Record<SosAlertStatus, string> = {
  [SOS_ALERT_STATUS.open]: "Aberto",
  [SOS_ALERT_STATUS.resolved]: "Resolvido",
  [SOS_ALERT_STATUS.cancelled]: "Cancelado",
};

export function isOpenSosAlert(status: SosAlertStatus): boolean {
  return status === SOS_ALERT_STATUS.open;
}

export function isTerminalSosAlert(status: SosAlertStatus): boolean {
  return (
    status === SOS_ALERT_STATUS.resolved ||
    status === SOS_ALERT_STATUS.cancelled
  );
}

export function parseSosAlertStatus(value: unknown): SosAlertStatus | null {
  if (
    value === SOS_ALERT_STATUS.open ||
    value === SOS_ALERT_STATUS.resolved ||
    value === SOS_ALERT_STATUS.cancelled
  ) {
    return value;
  }
  return null;
}
