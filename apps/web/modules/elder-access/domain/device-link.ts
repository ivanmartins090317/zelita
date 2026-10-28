export const DEVICE_LINK_TTL_MS = 15 * 60 * 1000;
export const DEVICE_LINK_HOUR_MS = 60 * 60 * 1000;
export const DEVICE_LINK_HOURLY_LIMIT = 5;
export const DEVICE_TOKEN_BYTES = 32;
export const DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;
export const ELDER_DEVICE_COOKIE = "zelita_elder_device";
export const ELDER_DEVICE_COOKIE_PATH = "/idoso";
export const DEVICE_LINK_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const DEVICE_LINK_CHANNELS = {
  whatsapp: "whatsapp",
  inPerson: "in_person",
} as const;

export type DeviceLinkChannel =
  (typeof DEVICE_LINK_CHANNELS)[keyof typeof DEVICE_LINK_CHANNELS];

export const DEVICE_LABELS = {
  iphone: "iphone",
  android: "android",
  computer: "computer",
} as const;

export type DeviceLabel = (typeof DEVICE_LABELS)[keyof typeof DEVICE_LABELS];

export const DEVICE_LABEL_COPY: Record<DeviceLabel, string> = {
  iphone: "iPhone",
  android: "Android",
  computer: "Computador",
};

export const LINK_ISSUE_BLOCKS = {
  activeDevice: "active_device",
  hourlyLimit: "hourly_limit",
} as const;

export type LinkIssueBlock =
  (typeof LINK_ISSUE_BLOCKS)[keyof typeof LINK_ISSUE_BLOCKS];

export const REMOTE_SEND_BLOCKS = {
  missingWhatsapp: "missing_whatsapp",
  missingOptIn: "missing_opt_in",
} as const;

export type RemoteSendBlock =
  (typeof REMOTE_SEND_BLOCKS)[keyof typeof REMOTE_SEND_BLOCKS];

export type ElderDoor = "device" | "preview" | "closed";

export type WhatsappSendOutcome = "sent" | "dry_run" | "failed";

/** Só a administradora cria link e desvincula. Espelha `canInviteOrChangeRoles`. */
export function canManageElderDevice(role: string | null | undefined): boolean {
  return role === "admin";
}

/** Cuidador lê a lista. Visualizador e contato de emergência não entram. */
export function canViewElderDevices(role: string | null | undefined): boolean {
  return role === "admin" || role === "caregiver";
}

/** Conta pausada continua podendo vincular, ler e desvincular. */
export function linkingAllowedWhenPaused(): boolean {
  return true;
}

export function deviceLinkExpiresAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + DEVICE_LINK_TTL_MS);
}

export function deviceLinkHourStart(now: Date): Date {
  return new Date(now.getTime() - DEVICE_LINK_HOUR_MS);
}

export function isDeviceLinkOpen(input: {
  usedAt: Date | null;
  expiresAt: Date;
  now: Date;
}): boolean {
  if (input.usedAt) return false;
  return input.expiresAt.getTime() > input.now.getTime();
}

export function linkIssueBlock(input: {
  hasActiveDevice: boolean;
  linksInLastHour: number;
}): LinkIssueBlock | null {
  if (input.hasActiveDevice) return LINK_ISSUE_BLOCKS.activeDevice;
  if (input.linksInLastHour >= DEVICE_LINK_HOURLY_LIMIT) {
    return LINK_ISSUE_BLOCKS.hourlyLimit;
  }
  return null;
}

export function canConfirmDeviceLink(input: {
  linkOpen: boolean;
  hasActiveDevice: boolean;
}): boolean {
  return input.linkOpen && !input.hasActiveDevice;
}

export function remoteSendBlock(input: {
  whatsapp: string | null | undefined;
  optedIn: boolean;
}): RemoteSendBlock | null {
  const digits = (input.whatsapp ?? "").replace(/\D/g, "");
  if (!digits) return REMOTE_SEND_BLOCKS.missingWhatsapp;
  if (!input.optedIn) return REMOTE_SEND_BLOCKS.missingOptIn;
  return null;
}

export function classifyDeviceLabel(
  userAgent: string | null | undefined,
): DeviceLabel {
  const agent = userAgent ?? "";
  if (/iphone/i.test(agent)) return DEVICE_LABELS.iphone;
  if (/android/i.test(agent)) return DEVICE_LABELS.android;
  return DEVICE_LABELS.computer;
}

export function maskWhatsapp(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 4) return "";
  return `•••• ${digits.slice(-4)}`;
}

export function deviceLinkFirstName(
  displayName: string | null | undefined,
): string {
  const first = (displayName ?? "").trim().split(/\s+/).filter(Boolean)[0];
  return first || "você";
}

export function isDeviceLinkTokenShape(token: string): boolean {
  return DEVICE_LINK_TOKEN_PATTERN.test(token);
}

/** Vercel não registra dry-run como enviado. O ambiente local pode. */
export function isHostedWhatsappRuntime(vercelFlag: string | undefined): boolean {
  return vercelFlag === "1";
}

export function interpretWhatsappSend(input: {
  hosted: boolean;
  providerOk: boolean;
  dryRun: boolean;
}): WhatsappSendOutcome {
  if (!input.providerOk) return "failed";
  if (input.dryRun && input.hosted) return "failed";
  if (input.dryRun) return "dry_run";
  return "sent";
}

/** O cookie do aparelho ganha da prévia. Sem as duas chaves, a porta fecha. */
export function resolveElderDoor(input: {
  hasActiveDevice: boolean;
  hasFamilyPreview: boolean;
}): ElderDoor {
  if (input.hasActiveDevice) return "device";
  if (input.hasFamilyPreview) return "preview";
  return "closed";
}

export function showsPreviewBanner(door: ElderDoor): boolean {
  return door === "preview";
}

/** A frase de família avisada fica só na prévia. No aparelho ela mente. */
export function elderHelpClaimsFamilyNotified(door: ElderDoor): boolean {
  return door === "preview";
}

export function formatPanelDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("day")}/${pick("month")}/${pick("year")} ${pick("hour")}:${pick("minute")}`;
}

export function deviceStatusLine(input: {
  label: DeviceLabel;
  linkedAt: Date;
}): string {
  return `${DEVICE_LABEL_COPY[input.label]} · ligado em ${formatPanelDateTime(input.linkedAt)}`;
}
