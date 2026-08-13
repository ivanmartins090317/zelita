import type { AccountRole } from "@/modules/accounts/domain/roles";
import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  NOTIFICATION_ALERT_TYPE,
  NOTIFICATION_CHANNEL,
  type NotificationAlertType,
  type NotificationChannel,
} from "./alert-feed-types";

export type NotificationChannelSet = NotificationChannel[];

/** Defaults por papel — PRD §7.2 / protótipo #v-alertas. */
const DEFAULTS_BY_ROLE: Record<
  AccountRole,
  Record<NotificationAlertType, NotificationChannel[]>
> = {
  [ACCOUNT_ROLES.admin]: {
    [NOTIFICATION_ALERT_TYPE.sos]: [
      NOTIFICATION_CHANNEL.whatsapp,
      NOTIFICATION_CHANNEL.call,
    ],
    [NOTIFICATION_ALERT_TYPE.packRefill]: [
      NOTIFICATION_CHANNEL.email,
      NOTIFICATION_CHANNEL.panel,
    ],
    [NOTIFICATION_ALERT_TYPE.zoneExit]: [NOTIFICATION_CHANNEL.whatsapp],
    [NOTIFICATION_ALERT_TYPE.reminderUnread]: [NOTIFICATION_CHANNEL.panel],
  },
  [ACCOUNT_ROLES.caregiver]: {
    [NOTIFICATION_ALERT_TYPE.sos]: [NOTIFICATION_CHANNEL.whatsapp],
    [NOTIFICATION_ALERT_TYPE.packRefill]: [NOTIFICATION_CHANNEL.email],
    [NOTIFICATION_ALERT_TYPE.zoneExit]: [NOTIFICATION_CHANNEL.whatsapp],
    [NOTIFICATION_ALERT_TYPE.reminderUnread]: [NOTIFICATION_CHANNEL.panel],
  },
  [ACCOUNT_ROLES.viewer]: {
    [NOTIFICATION_ALERT_TYPE.sos]: [NOTIFICATION_CHANNEL.panel],
    [NOTIFICATION_ALERT_TYPE.packRefill]: [],
    [NOTIFICATION_ALERT_TYPE.zoneExit]: [],
    [NOTIFICATION_ALERT_TYPE.reminderUnread]: [],
  },
  [ACCOUNT_ROLES.emergency_contact]: {
    [NOTIFICATION_ALERT_TYPE.sos]: [NOTIFICATION_CHANNEL.call],
    [NOTIFICATION_ALERT_TYPE.packRefill]: [],
    [NOTIFICATION_ALERT_TYPE.zoneExit]: [],
    [NOTIFICATION_ALERT_TYPE.reminderUnread]: [],
  },
};

export function resolveDefaultChannels(
  role: AccountRole,
  alertType: NotificationAlertType,
): NotificationChannel[] {
  return [...(DEFAULTS_BY_ROLE[role]?.[alertType] ?? [])];
}

export function buildDefaultMatrixForMember(input: {
  memberId: string;
  role: AccountRole;
}): Array<{
  memberId: string;
  alertType: NotificationAlertType;
  channels: NotificationChannel[];
}> {
  return (
    Object.values(NOTIFICATION_ALERT_TYPE) as NotificationAlertType[]
  ).map((alertType) => ({
    memberId: input.memberId,
    alertType,
    channels: resolveDefaultChannels(input.role, alertType),
  }));
}

export function mergeMatrixWithDefaults(input: {
  memberId: string;
  role: AccountRole;
  saved: Array<{
    alertType: NotificationAlertType;
    channels: NotificationChannel[];
  }>;
}): Record<NotificationAlertType, NotificationChannel[]> {
  const result = {} as Record<NotificationAlertType, NotificationChannel[]>;

  for (const alertType of Object.values(NOTIFICATION_ALERT_TYPE)) {
    const savedRow = input.saved.find((row) => row.alertType === alertType);
    result[alertType as NotificationAlertType] = savedRow
      ? [...savedRow.channels]
      : resolveDefaultChannels(input.role, alertType as NotificationAlertType);
  }

  return result;
}

/** Membro com painel: tem profile_id (login). Contato só-telefone fica fora da tabela. */
export function memberHasPanelAccess(input: {
  profileId: string | null;
  role: AccountRole;
}): boolean {
  if (input.profileId) return true;
  return input.role !== ACCOUNT_ROLES.emergency_contact;
}

export function hasEmergencyPhoneOnlyMembers(
  members: Array<{ profileId: string | null; role: AccountRole }>,
): boolean {
  return members.some(
    (member) =>
      member.role === ACCOUNT_ROLES.emergency_contact && !member.profileId,
  );
}
