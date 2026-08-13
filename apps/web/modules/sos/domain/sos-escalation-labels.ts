import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";

export interface EscalationLabelCopy {
  adminChannel: string;
  caregiverChannel: string;
  viewerChannel: string;
  emergencyImmediate: string;
  emergencyDelayed: string;
}

export function buildEscalationChannelLabel(
  role: AccountRole,
  position: number,
  totalCount: number,
  copy: EscalationLabelCopy,
): string {
  if (role === ACCOUNT_ROLES.admin) return copy.adminChannel;
  if (role === ACCOUNT_ROLES.caregiver) return copy.caregiverChannel;
  if (role === ACCOUNT_ROLES.viewer) return copy.viewerChannel;
  if (role === ACCOUNT_ROLES.emergency_contact) {
    const isLast = position === totalCount;
    return isLast ? copy.emergencyDelayed : copy.emergencyImmediate;
  }
  return copy.emergencyImmediate;
}

export function formatNotificationAttemptLine(
  displayName: string,
  timeLabel: string,
  channelLabel: string,
  statusLabel: string,
  template: string,
): string {
  return template
    .replace("{nome}", displayName)
    .replace("{hora}", timeLabel)
    .replace("{canal}", channelLabel)
    .replace("{status}", statusLabel);
}

const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  call: "ligação",
  email: "e-mail",
} as const;

const STATUS_LABELS = {
  pending: "pendente",
  sent: "enviado",
  delivered: "entregue",
  read: "lido",
  answered: "atendida",
  failed: "falhou",
} as const;

export function resolveChannelLabel(channel: string): string {
  return CHANNEL_LABELS[channel as keyof typeof CHANNEL_LABELS] ?? channel;
}

export function resolveNotificationStatusLabel(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status;
}
