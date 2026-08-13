/** API pública do módulo `alerts` — F4.9 Avisos. */
export const alertsModule = { id: "alerts" } as const;

export { getAvisosPage, getAvisosOpenCount } from "./application/get-avisos-page";
export { getHojeAlertsSnapshot } from "./application/get-hoje-alerts-snapshot";
export { updateNotificationPreferencesAction } from "./application/update-notification-preferences";
export {
  canEditNotificationPreferences,
  canViewNotificationMatrix,
} from "./application/can-edit-notification-preferences";
export { computeAlertOpenCount, buildNoticesStat } from "./domain/alert-open-count";
export type { AlertFeedItem } from "./domain/alert-feed-item";
