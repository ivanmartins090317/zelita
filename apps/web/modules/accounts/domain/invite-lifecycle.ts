export const INVITE_VALIDITY_DAYS = 7;

export type ParticipantSituation = "active" | "pending" | "expired";

export interface ParticipantSituationDisplay {
  label: string;
  tone: "ok" | "warning" | "muted";
}

export function computeInviteExpiresAt(from: Date = new Date()): Date {
  const expires = new Date(from);
  expires.setUTCDate(expires.getUTCDate() + INVITE_VALIDITY_DAYS);
  return expires;
}

export function isInviteExpired(
  expiresAt: Date | string,
  now: Date = new Date(),
): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() <= now.getTime();
}

export function resolveParticipantSituation(input: {
  status: "active" | "pending" | "expired";
}): ParticipantSituation {
  return input.status;
}

export function buildParticipantSituationDisplay(
  situation: ParticipantSituation,
  labels: Record<ParticipantSituation, ParticipantSituationDisplay>,
): ParticipantSituationDisplay {
  return labels[situation];
}

export function buildParticipantTitle(input: {
  displayName: string;
  relationshipLabel?: string | null;
  isSelf?: boolean;
  selfSuffix?: string;
}): string {
  const name = input.isSelf
    ? `${input.displayName}${input.selfSuffix ?? ""}`
    : input.displayName;
  if (input.relationshipLabel?.trim()) {
    return `${name} · ${input.relationshipLabel.trim()}`;
  }
  return name;
}

export function buildParticipantSubtitle(input: {
  email?: string | null;
  phone?: string | null;
  scheduleNote?: string | null;
}): string {
  const parts: string[] = [];
  if (input.email) parts.push(input.email);
  if (input.phone) parts.push(input.phone);
  if (input.scheduleNote) parts.push(input.scheduleNote);
  return parts.join(" · ");
}

export function generateInviteToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function buildInviteAcceptPath(token: string): string {
  return `/convite/${token}`;
}

export function buildInviteAcceptUrl(token: string, baseUrl?: string): string {
  const path = buildInviteAcceptPath(token);
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}
