import type { AccountRole } from "@/modules/accounts/domain/roles";
import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

/** Filtros fixos do feed — MVP. */
export const ALERT_FEED_FILTER = {
  all: "all",
  emergency: "emergency",
  medications: "medications",
  location: "location",
} as const;

export type AlertFeedFilter =
  (typeof ALERT_FEED_FILTER)[keyof typeof ALERT_FEED_FILTER];

/** Tipos de linha agregada no feed. */
export const ALERT_FEED_TYPE = {
  packRefill: "pack_refill",
  packLastDay: "pack_last_day",
  reminderUnread: "reminder_unread",
  sos: "sos",
  zoneExit: "zone_exit",
  invitePending: "invite_pending",
  examUncategorized: "exam_uncategorized",
} as const;

export type AlertFeedType =
  (typeof ALERT_FEED_TYPE)[keyof typeof ALERT_FEED_TYPE];

export const ALERT_FEED_STATUS = {
  open: "open",
  resolved: "resolved",
} as const;

export type AlertFeedStatus =
  (typeof ALERT_FEED_STATUS)[keyof typeof ALERT_FEED_STATUS];

/** Categorias para filtro por chip. */
export const ALERT_FEED_CATEGORY = {
  emergency: "emergency",
  medications: "medications",
  location: "location",
  account: "account",
} as const;

export type AlertFeedCategory =
  (typeof ALERT_FEED_CATEGORY)[keyof typeof ALERT_FEED_CATEGORY];

const TYPE_TO_CATEGORY: Record<AlertFeedType, AlertFeedCategory> = {
  [ALERT_FEED_TYPE.packRefill]: ALERT_FEED_CATEGORY.medications,
  [ALERT_FEED_TYPE.packLastDay]: ALERT_FEED_CATEGORY.medications,
  [ALERT_FEED_TYPE.reminderUnread]: ALERT_FEED_CATEGORY.medications,
  [ALERT_FEED_TYPE.sos]: ALERT_FEED_CATEGORY.emergency,
  [ALERT_FEED_TYPE.zoneExit]: ALERT_FEED_CATEGORY.location,
  [ALERT_FEED_TYPE.invitePending]: ALERT_FEED_CATEGORY.account,
  [ALERT_FEED_TYPE.examUncategorized]: ALERT_FEED_CATEGORY.account,
};

const FILTER_TO_CATEGORIES: Record<
  Exclude<AlertFeedFilter, "all">,
  AlertFeedCategory[]
> = {
  [ALERT_FEED_FILTER.emergency]: [ALERT_FEED_CATEGORY.emergency],
  [ALERT_FEED_FILTER.medications]: [ALERT_FEED_CATEGORY.medications],
  [ALERT_FEED_FILTER.location]: [ALERT_FEED_CATEGORY.location],
};

/** Tipos de aviso na matriz Quem recebe o quê. */
export const NOTIFICATION_ALERT_TYPE = {
  sos: "sos",
  packRefill: "pack_refill",
  zoneExit: "zone_exit",
  reminderUnread: "reminder_unread",
} as const;

export type NotificationAlertType =
  (typeof NOTIFICATION_ALERT_TYPE)[keyof typeof NOTIFICATION_ALERT_TYPE];

export const NOTIFICATION_MATRIX_ROW_ORDER: NotificationAlertType[] = [
  NOTIFICATION_ALERT_TYPE.sos,
  NOTIFICATION_ALERT_TYPE.packRefill,
  NOTIFICATION_ALERT_TYPE.zoneExit,
  NOTIFICATION_ALERT_TYPE.reminderUnread,
];

/** Canais de notificação (intenção — envio real via Inngest). */
export const NOTIFICATION_CHANNEL = {
  panel: "panel",
  email: "email",
  whatsapp: "whatsapp",
  call: "call",
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

export const ALL_NOTIFICATION_CHANNELS: NotificationChannel[] = [
  NOTIFICATION_CHANNEL.panel,
  NOTIFICATION_CHANNEL.email,
  NOTIFICATION_CHANNEL.whatsapp,
  NOTIFICATION_CHANNEL.call,
];

export const FEED_RETENTION_DAYS = 90;
export const FEED_PAGE_SIZE = 50;

export function resolveAlertCategory(type: AlertFeedType): AlertFeedCategory {
  return TYPE_TO_CATEGORY[type];
}

export function matchesFeedFilter(
  type: AlertFeedType,
  filter: AlertFeedFilter,
): boolean {
  if (filter === ALERT_FEED_FILTER.all) return true;
  const category = resolveAlertCategory(type);
  return FILTER_TO_CATEGORIES[filter].includes(category);
}

/** Visualizador: tipos permitidos no feed conforme defaults PRD. */
export function canViewAlertTypeForRole(
  role: AccountRole,
  type: AlertFeedType,
): boolean {
  if (
    role === ACCOUNT_ROLES.admin ||
    role === ACCOUNT_ROLES.caregiver
  ) {
    return true;
  }
  if (role === ACCOUNT_ROLES.viewer) {
    return (
      type === ALERT_FEED_TYPE.packRefill ||
      type === ALERT_FEED_TYPE.reminderUnread
    );
  }
  return false;
}

export function isEmergencyFeedType(type: AlertFeedType): boolean {
  return type === ALERT_FEED_TYPE.sos;
}
