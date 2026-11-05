import { familyContent, familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  buildExternalMapUrl,
  resolveLocationForSos,
  toSafePlaceCoords,
} from "@/modules/location/application/resolve-location-for-sos";
import { fetchSosLocationPointNear } from "@/modules/location/infrastructure/location-point-repo";
import { fetchSafePlacesForCareRecipient } from "@/modules/location/infrastructure/safe-place-repo";

import { canViewSosAreaForRole } from "./can-view-sos-area";
import { canManageSosEscalationForRole } from "./can-manage-sos-escalation";
import { canResolveSosAlertForRole } from "./can-resolve-sos-alert";
import {
  SOS_ALERT_STATUS,
  SOS_ALERT_STATUS_LABELS,
} from "../domain/sos-alert-status";
import {
  buildEscalationChannelLabel,
  formatNotificationAttemptLine,
  resolveChannelLabel,
  resolveNotificationStatusLabel,
} from "../domain/sos-escalation-labels";
import {
  isDefaultEligibleForEscalation,
  isEligibleForEscalation,
} from "../domain/sos-eligibility";
import {
  buildHistorySummary,
  buildResolutionOutcomeLine,
  shouldShowResolveAction,
} from "../domain/sos-resolution";
import { fetchSosAlertsForCareRecipient } from "../infrastructure/sos-alert-repo";
import {
  fetchSosEscalationConfig,
  isProfileInSosEscalation,
  type SosEscalationEntryRow,
} from "../infrastructure/sos-escalation-repo";
import { fetchNotificationAttemptsForAlert } from "../infrastructure/sos-notification-repo";

const TIME_ZONE = "America/Sao_Paulo";

export interface SosEscalationListItem {
  position: number;
  memberId: string;
  profileId: string | null;
  displayName: string;
  relationshipLabel: string | null;
  role: string;
  roleLabel: string;
  channelSummary: string;
  isInvalid: boolean;
}

export interface SosHistoryListItem {
  id: string;
  dateLabel: string;
  timeLabel: string;
  summary: string;
  icon: string;
  status: string;
}

export interface SosAlertDetailViewModel {
  id: string;
  status: string;
  statusLabel: string;
  headline: string;
  personLine: string;
  triggeredAtLabel: string;
  alertTypeLabel: string;
  locationLine: string;
  locationMeta: string | null;
  callbackPhone: string | null;
  notifiedLines: string[];
  notifiedEmptyCopy: string;
  outcomeLine: string | null;
  showResolveAction: boolean;
  showMapLink: boolean;
  mapHref: string;
}

export interface PedidosDeAjudaPageViewModel {
  selectedAlert: SosAlertDetailViewModel | null;
  escalationItems: SosEscalationListItem[];
  escalationEmpty: boolean;
  escalationInvalidWarning: boolean;
  historyItems: SosHistoryListItem[];
  modalCandidates: SosEscalationListItem[];
  canManageEscalation: boolean;
  canResolve: boolean;
  isPaused: boolean;
  careRecipientId: string;
  selectedAlertId: string | null;
  hasAlerts: boolean;
  showSingleContactWarning: boolean;
}

export type PedidosDeAjudaPageResult =
  | { ok: true; data: PedidosDeAjudaPageViewModel }
  | { ok: false; reason: "forbidden" | "load_failed"; message: string };

function formatDateTime(iso: string): { date: string; time: string; full: string } {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return {
    date: datePart,
    time: timePart,
    full: `${datePart} às ${timePart}`,
  };
}

function computeAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T12:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function buildPersonLine(
  fullName: string | null,
  displayName: string,
  birthDate: string | null,
  template: string,
): string {
  const age = computeAge(birthDate);
  const agePart = age !== null ? `, ${age} anos` : "";
  const civil = fullName?.trim() ? `${fullName} (${displayName})` : displayName;
  return template.replace("{pessoa}", `${civil}${agePart}`);
}

function buildLocationBlock(
  alert: Awaited<ReturnType<typeof fetchSosAlertsForCareRecipient>>[number],
  safePlaces: ReturnType<typeof toSafePlaceCoords>,
  copy: typeof familyContent.pedidosDeAjuda,
  point: { lat: number | null; lng: number | null; accuracyM: number | null; recordedAt: string } | null,
): { line: string; meta: string | null; hasMapTarget: boolean; mapHref: string | null } {
  const resolved = resolveLocationForSos(
    {
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      locationText: alert.locationText,
      safeZoneName: alert.safeZoneName,
      safePlaces,
    },
    {
      unavailable: copy.detail.locationUnavailable,
      insideZone: copy.detail.locationInsideZone,
    },
  );

  let meta: string | null = null;
  const metaParts: string[] = [];
  const accuracyM = alert.locationAccuracyM ?? point?.accuracyM ?? null;
  const recordedAt = alert.locationRecordedAt ?? point?.recordedAt ?? null;
  if (accuracyM != null) {
    metaParts.push(
      copy.detail.locationAccuracy.replace("{metros}", String(accuracyM)),
    );
  }
  if (recordedAt) {
    metaParts.push(
      copy.detail.locationTime.replace("{hora}", formatDateTime(recordedAt).time),
    );
  }
  if (resolved.zoneLine) {
    metaParts.push(resolved.zoneLine);
  } else if (alert.safeZoneName) {
    metaParts.push(
      copy.detail.locationZone.replace("{zona}", alert.safeZoneName),
    );
  }
  if (metaParts.length > 0) {
    meta = metaParts.join(" · ");
  }

  const mapHref =
    point?.lat != null && point.lng != null
      ? buildExternalMapUrl({ lat: point.lat, lng: point.lng })
      : null;

  return {
    line: resolved.locationLine,
    meta,
    hasMapTarget: resolved.hasMapTarget,
    mapHref,
  };
}

function mapEscalationEntry(
  entry: SosEscalationEntryRow,
  totalCount: number,
  activeMemberIds: Set<string>,
  copy: typeof familyContent.pedidosDeAjuda,
): SosEscalationListItem {
  const channelSummary = buildEscalationChannelLabel(
    entry.role,
    entry.position,
    totalCount,
    copy.escalation.channels,
  );

  const isInvalid =
    entry.memberId !== null && !activeMemberIds.has(entry.memberId);

  return {
    position: entry.position,
    memberId: entry.memberId ?? entry.id,
    profileId: entry.profileId,
    displayName: entry.displayName,
    relationshipLabel: entry.relationshipLabel,
    role: entry.role,
    roleLabel: copy.escalation.roleLabels[entry.role] ?? entry.role,
    channelSummary,
    isInvalid,
  };
}

function buildModalCandidates(
  participants: Awaited<ReturnType<typeof fetchParticipantRows>>,
  savedMemberIds: Set<string>,
  copy: typeof familyContent.pedidosDeAjuda,
): SosEscalationListItem[] {
  const activeMembers = participants.filter(
    (row) => row.kind === "member" && row.situation === "active",
  );

  const items: SosEscalationListItem[] = [];
  let position = 1;

  for (const member of activeMembers) {
    const explicitlyIncluded =
      member.role === "viewer" && savedMemberIds.has(member.id);
    if (!isEligibleForEscalation(member.role, explicitlyIncluded)) {
      if (!isDefaultEligibleForEscalation(member.role)) continue;
    }

    items.push({
      position,
      memberId: member.id,
      profileId: member.profileId,
      displayName: member.displayName,
      relationshipLabel: member.relationshipLabel,
      role: member.role,
      roleLabel: copy.escalation.roleLabels[member.role] ?? member.role,
      channelSummary: buildEscalationChannelLabel(
        member.role,
        position,
        activeMembers.length,
        copy.escalation.channels,
      ),
      isInvalid: false,
    });
    position += 1;
  }

  return items;
}

export async function getPedidosDeAjudaPage(input?: {
  alertId?: string | null;
}): Promise<PedidosDeAjudaPageResult> {
  const copy = familyContent.pedidosDeAjuda;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return {
        ok: false,
        reason: "forbidden",
        message: copy.errors.incompleteAccount,
      };
    }

    const supabase = await createSupabaseServerClient();
    const inEscalation = await isProfileInSosEscalation(
      supabase,
      ctx.accountId,
      ctx.userId,
    );

    if (!canViewSosAreaForRole(ctx.role, inEscalation)) {
      return {
        ok: false,
        reason: "forbidden",
        message: copy.errors.accessDenied,
      };
    }

    const shell = await getShellContext();
    const participants = await fetchParticipantRows(supabase, ctx.accountId);
    const activeMemberIds = new Set(
      participants
        .filter((row) => row.kind === "member" && row.situation === "active")
        .map((row) => row.id),
    );

    const [alerts, escalationConfig, careRecipient, safePlaces] = await Promise.all([
      fetchSosAlertsForCareRecipient(supabase, ctx.careRecipientId),
      fetchSosEscalationConfig(supabase, ctx.careRecipientId),
      supabase
        .from("care_recipients")
        .select("full_name, display_name, birth_date, whatsapp")
        .eq("id", ctx.careRecipientId)
        .single(),
      fetchSafePlacesForCareRecipient(supabase, ctx.careRecipientId),
    ]);

    if (careRecipient.error) {
      throw new Error(careRecipient.error.message);
    }

    const recipient = careRecipient.data;
    const apelido =
      shell?.careRecipientDisplayName ??
      (recipient.display_name as string) ??
      "Pessoa cuidada";

    const escalationEntries = escalationConfig?.entries ?? [];
    const totalEscalation = escalationEntries.length;
    const escalationItems = escalationEntries.map((entry) =>
      mapEscalationEntry(entry, totalEscalation, activeMemberIds, copy),
    );
    const escalationInvalidWarning = escalationItems.some(
      (item) => item.isInvalid,
    );

    const savedMemberIds = new Set(
      escalationEntries
        .map((entry) => entry.memberId)
        .filter((id): id is string => Boolean(id)),
    );

    const defaultCandidates = buildModalCandidates(
      participants,
      savedMemberIds,
      copy,
    );

    const modalCandidates =
      escalationItems.length > 0
        ? escalationItems.filter((item) => !item.isInvalid)
        : defaultCandidates;

    const selectedId =
      input?.alertId && alerts.some((alert) => alert.id === input.alertId)
        ? input.alertId
        : alerts[0]?.id ?? null;

    let selectedAlert: SosAlertDetailViewModel | null = null;

    if (selectedId) {
      const alert = alerts.find((row) => row.id === selectedId);
      if (alert) {
        const resolverName = alert.resolvedBy
          ? (
              await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", alert.resolvedBy)
                .maybeSingle()
            ).data?.full_name ?? "Alguém"
          : null;

        const attempts = await fetchNotificationAttemptsForAlert(
          supabase,
          alert.id,
        );

        const notifiedLines =
          attempts.length > 0
            ? attempts.map((attempt) =>
                formatNotificationAttemptLine(
                  attempt.displayName,
                  formatDateTime(attempt.attemptedAt).time,
                  resolveChannelLabel(attempt.channel),
                  resolveNotificationStatusLabel(attempt.status),
                  copy.detail.notifiedLineTemplate,
                ),
              )
            : [];

        const triggered = formatDateTime(alert.triggeredAt);
        let sosPoint: Awaited<ReturnType<typeof fetchSosLocationPointNear>> = null;
        try {
          sosPoint = await fetchSosLocationPointNear(
            createSupabaseServiceClient(),
            ctx.careRecipientId,
            alert.triggeredAt,
          );
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("[getPedidosDeAjudaPage] sos_point_unavailable", {
              alertId: alert.id,
              careRecipientId: ctx.careRecipientId,
              reason: error instanceof Error ? error.name : "unknown",
            });
          }
        }
        const location = buildLocationBlock(
          alert,
          toSafePlaceCoords(safePlaces),
          copy,
          sosPoint,
        );

        let outcomeLine: string | null = null;
        if (alert.status === SOS_ALERT_STATUS.resolved && alert.resolvedAt) {
          outcomeLine = buildResolutionOutcomeLine(
            resolverName ?? "Alguém",
            formatDateTime(alert.resolvedAt).time,
            alert.resolutionNote,
            copy.detail.outcomeWithNote,
            copy.detail.outcomeWithoutNote,
          );
        }

        selectedAlert = {
          id: alert.id,
          status: alert.status,
          statusLabel: SOS_ALERT_STATUS_LABELS[alert.status],
          headline: copy.detail.headline.replace("{apelido}", apelido),
          personLine: buildPersonLine(
            recipient.full_name as string,
            apelido,
            (recipient.birth_date as string | null) ?? null,
            copy.detail.personTemplate,
          ),
          triggeredAtLabel: triggered.full,
          alertTypeLabel: copy.detail.alertType,
          locationLine:
            sosPoint?.lat != null &&
            sosPoint.lng != null &&
            !alert.locationText?.trim()
              ? "Posição recebida do celular"
              : location.line,
          locationMeta: location.meta,
          callbackPhone: (recipient.whatsapp as string | null) ?? null,
          notifiedLines,
          notifiedEmptyCopy: copy.detail.notifiedPending,
          outcomeLine,
          showResolveAction: shouldShowResolveAction(alert.status, ctx.role),
          showMapLink: location.hasMapTarget,
          mapHref:
            location.mapHref ??
            `${familyRoutes.localizacao}?focus=alert&alerta=${alert.id}`,
        };
      }
    }

    const historyItems: SosHistoryListItem[] = alerts.map((alert) => {
      const dt = formatDateTime(alert.triggeredAt);
      const summary = buildHistorySummary({
        status: alert.status,
        triggeredAt: new Date(alert.triggeredAt),
        resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
        resolutionNote: alert.resolutionNote,
        copy: copy.history.summary,
      });

      return {
        id: alert.id,
        dateLabel: dt.date.slice(0, 5),
        timeLabel: dt.time,
        summary,
        icon:
          alert.status === SOS_ALERT_STATUS.cancelled
            ? copy.history.cancelledIcon
            : copy.history.sosIcon,
        status: alert.status,
      };
    });

    return {
      ok: true,
      data: {
        selectedAlert,
        escalationItems: escalationItems.filter((item) => !item.isInvalid),
        escalationEmpty: escalationItems.filter((item) => !item.isInvalid).length === 0,
        escalationInvalidWarning,
        historyItems,
        modalCandidates,
        canManageEscalation: canManageSosEscalationForRole(ctx.role),
        canResolve: canResolveSosAlertForRole(ctx.role),
        isPaused: isAccountPaused(ctx.accountStatus ?? "active"),
        careRecipientId: ctx.careRecipientId,
        selectedAlertId: selectedId,
        hasAlerts: alerts.length > 0,
        showSingleContactWarning:
          escalationItems.filter((item) => !item.isInvalid).length === 1,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getPedidosDeAjudaPage] load_failed", error);
    }
    return {
      ok: false,
      reason: "load_failed",
      message: copy.errors.loadFailed,
    };
  }
}
