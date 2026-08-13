import type { AccountRole } from "@/modules/accounts/domain/roles";
import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  NOTIFICATION_ALERT_TYPE,
  NOTIFICATION_CHANNEL,
  type NotificationAlertType,
  type NotificationChannel,
} from "./alert-feed-types";

const CHANNELS_BY_ROLE: Record<AccountRole, NotificationChannel[]> = {
  [ACCOUNT_ROLES.admin]: [
    NOTIFICATION_CHANNEL.panel,
    NOTIFICATION_CHANNEL.email,
    NOTIFICATION_CHANNEL.whatsapp,
    NOTIFICATION_CHANNEL.call,
  ],
  [ACCOUNT_ROLES.caregiver]: [
    NOTIFICATION_CHANNEL.panel,
    NOTIFICATION_CHANNEL.email,
    NOTIFICATION_CHANNEL.whatsapp,
    NOTIFICATION_CHANNEL.call,
  ],
  [ACCOUNT_ROLES.viewer]: [NOTIFICATION_CHANNEL.panel],
  [ACCOUNT_ROLES.emergency_contact]: [
    NOTIFICATION_CHANNEL.whatsapp,
    NOTIFICATION_CHANNEL.call,
  ],
};

/** Canais que cada papel pode configurar por tipo de aviso. */
export function allowedChannelsForMember(
  role: AccountRole,
  alertType: NotificationAlertType,
): NotificationChannel[] {
  const base = CHANNELS_BY_ROLE[role] ?? [];

  if (alertType === NOTIFICATION_ALERT_TYPE.sos) {
    if (role === ACCOUNT_ROLES.viewer) {
      return [NOTIFICATION_CHANNEL.panel];
    }
    if (role === ACCOUNT_ROLES.emergency_contact) {
      return [NOTIFICATION_CHANNEL.whatsapp, NOTIFICATION_CHANNEL.call];
    }
  }

  if (role === ACCOUNT_ROLES.emergency_contact) {
    return alertType === NOTIFICATION_ALERT_TYPE.sos ? base : [];
  }

  if (role === ACCOUNT_ROLES.viewer) {
    if (alertType === NOTIFICATION_ALERT_TYPE.sos) {
      return [NOTIFICATION_CHANNEL.panel];
    }
    return [NOTIFICATION_CHANNEL.panel];
  }

  return base;
}

export function formatChannelCombinationLabel(
  channels: NotificationChannel[],
  labels: Record<NotificationChannel, string>,
): string {
  if (channels.length === 0) return "—";
  return channels.map((channel) => labels[channel]).join(" + ");
}

export function normalizeChannelSelection(
  channels: NotificationChannel[],
  allowed: NotificationChannel[],
): NotificationChannel[] {
  const allowedSet = new Set(allowed);
  const unique = new Set<NotificationChannel>();
  for (const channel of channels) {
    if (allowedSet.has(channel)) {
      unique.add(channel);
    }
  }
  return ALL_ORDER.filter((channel) => unique.has(channel));
}

const ALL_ORDER: NotificationChannel[] = [
  NOTIFICATION_CHANNEL.panel,
  NOTIFICATION_CHANNEL.email,
  NOTIFICATION_CHANNEL.whatsapp,
  NOTIFICATION_CHANNEL.call,
];

export interface ValidatePreferenceInput {
  role: AccountRole;
  alertType: NotificationAlertType;
  channels: NotificationChannel[];
}

export type ValidatePreferenceResult =
  | { ok: true; channels: NotificationChannel[] }
  | { ok: false; reason: "sos_emergency_required" | "invalid_channels" };

/** Contato de emergência não pode desligar pedido de ajuda. */
export function validateNotificationPreference(
  input: ValidatePreferenceInput,
): ValidatePreferenceResult {
  const allowed = allowedChannelsForMember(input.role, input.alertType);
  const normalized = normalizeChannelSelection(input.channels, allowed);

  if (
    input.role === ACCOUNT_ROLES.emergency_contact &&
    input.alertType === NOTIFICATION_ALERT_TYPE.sos &&
    normalized.length === 0
  ) {
    return { ok: false, reason: "sos_emergency_required" };
  }

  if (normalized.some((channel) => !allowed.includes(channel))) {
    return { ok: false, reason: "invalid_channels" };
  }

  return { ok: true, channels: normalized };
}

export function toggleChannel(
  current: NotificationChannel[],
  channel: NotificationChannel,
  allowed: NotificationChannel[],
): NotificationChannel[] {
  if (!allowed.includes(channel)) return current;
  if (current.includes(channel)) {
    return current.filter((item) => item !== channel);
  }
  return normalizeChannelSelection([...current, channel], allowed);
}
