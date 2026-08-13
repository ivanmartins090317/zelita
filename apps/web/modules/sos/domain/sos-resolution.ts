import type { AccountRole } from "@/modules/accounts/domain/roles";

import {
  isOpenSosAlert,
  isTerminalSosAlert,
  SOS_ALERT_STATUS,
  type SosAlertStatus,
} from "./sos-alert-status";
import { canResolveSosAlert } from "./sos-eligibility";

const RESOLUTION_NOTE_MAX_LENGTH = 500;

export { RESOLUTION_NOTE_MAX_LENGTH };

export interface ResolveSosInput {
  currentStatus: SosAlertStatus;
  actorRole: AccountRole;
}

export type ResolveSosResult =
  | { ok: true }
  | { ok: false; reason: "not_open" | "forbidden" | "already_resolved" };

export function validateResolveSosAlert(input: ResolveSosInput): ResolveSosResult {
  if (!canResolveSosAlert(input.actorRole)) {
    return { ok: false, reason: "forbidden" };
  }
  if (input.currentStatus === SOS_ALERT_STATUS.resolved) {
    return { ok: false, reason: "already_resolved" };
  }
  if (!isOpenSosAlert(input.currentStatus)) {
    return { ok: false, reason: "not_open" };
  }
  return { ok: true };
}

export function normalizeResolutionNote(note: string | null | undefined): string | null {
  const trimmed = note?.trim() ?? "";
  if (!trimmed) return null;
  return trimmed.slice(0, RESOLUTION_NOTE_MAX_LENGTH);
}

export function buildResolutionOutcomeLine(
  resolverName: string,
  timeLabel: string,
  note: string | null,
  withNoteTemplate: string,
  withoutNoteTemplate: string,
): string {
  if (note) {
    return withNoteTemplate
      .replace("{nome}", resolverName)
      .replace("{hora}", timeLabel)
      .replace("{observacao}", note);
  }
  return withoutNoteTemplate
    .replace("{nome}", resolverName)
    .replace("{hora}", timeLabel);
}

export function computeResolutionDurationMinutes(
  triggeredAt: Date,
  resolvedAt: Date,
): number {
  const diffMs = resolvedAt.getTime() - triggeredAt.getTime();
  return Math.max(0, Math.round(diffMs / 60_000));
}

export interface HistorySummaryInput {
  status: SosAlertStatus;
  triggeredAt: Date;
  resolvedAt: Date | null;
  resolutionNote: string | null;
  copy: {
    resolvedInMinutes: string;
    resolvedWithNote: string;
    cancelled: string;
    open: string;
  };
}

export function buildHistorySummary(input: HistorySummaryInput): string {
  if (input.status === SOS_ALERT_STATUS.cancelled) {
    return input.copy.cancelled;
  }
  if (input.status === SOS_ALERT_STATUS.open) {
    return input.copy.open;
  }
  if (!input.resolvedAt) {
    return input.copy.resolvedInMinutes.replace("{minutos}", "?");
  }
  const minutes = computeResolutionDurationMinutes(
    input.triggeredAt,
    input.resolvedAt,
  );
  const base = input.copy.resolvedInMinutes.replace(
    "{minutos}",
    String(minutes),
  );
  if (input.resolutionNote) {
    const minutes = input.resolvedAt
      ? computeResolutionDurationMinutes(input.triggeredAt, input.resolvedAt)
      : 0;
    const truncated =
      input.resolutionNote.length > 60
        ? `${input.resolutionNote.slice(0, 57)}…`
        : input.resolutionNote;
    return input.copy.resolvedWithNote
      .replace("{minutos}", String(minutes))
      .replace("{observacao}", truncated);
  }
  return base;
}

export function shouldShowResolveAction(
  status: SosAlertStatus,
  actorRole: AccountRole,
): boolean {
  return isOpenSosAlert(status) && canResolveSosAlert(actorRole);
}

export function isAlreadyResolvedError(
  status: SosAlertStatus,
): boolean {
  return isTerminalSosAlert(status) && status === SOS_ALERT_STATUS.resolved;
}
