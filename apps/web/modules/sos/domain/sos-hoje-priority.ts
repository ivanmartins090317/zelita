import type { NeedsPriorityItem } from "@/modules/agenda/domain/needs-priority";
import type { TimelineItem } from "@/modules/medications/domain/hoje-timeline";

import { isOpenSosAlert, SOS_ALERT_STATUS, type SosAlertStatus } from "./sos-alert-status";

/** Prioridade acima de cartela acabando (sortKey 0) e exame sem categoria (4). */
export const SOS_NEEDS_SORT_KEY = -1;

export interface OpenSosAlertSnapshot {
  id: string;
  status: SosAlertStatus;
  triggeredAt: Date;
  careRecipientDisplayName: string;
}

export interface HojeSosCopy {
  needsTitle: string;
  needsSubtitle: string;
  timelineTriggered: string;
  timelineResolved: string;
  pedidosHref: string;
}

export function buildOpenAlertNeedsItem(
  alert: OpenSosAlertSnapshot,
  timeLabel: string,
  copy: HojeSosCopy,
): NeedsPriorityItem {
  return {
    id: `sos-open-${alert.id}`,
    kind: "refill",
    sortKey: SOS_NEEDS_SORT_KEY,
    title: copy.needsTitle.replace("{apelido}", alert.careRecipientDisplayName),
    subtitle: copy.needsSubtitle.replace("{horario}", timeLabel),
    icon: "🆘",
    href: copy.pedidosHref,
  };
}

export function mergeSosNeedsItems(
  existing: NeedsPriorityItem[],
  sosItems: NeedsPriorityItem[],
  maxItems = 3,
): NeedsPriorityItem[] {
  return [...sosItems, ...existing]
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, maxItems);
}

export function buildSosTimelineItems(
  alerts: Array<{
    id: string;
    status: SosAlertStatus;
    triggeredAt: Date;
    resolvedAt: Date | null;
  }>,
  todayDateKey: string,
  timeZone: string,
  copy: HojeSosCopy,
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const alert of alerts) {
    const eventDate = alert.triggeredAt;
    const dateKey = formatDateKeyInTimeZone(eventDate, timeZone);
    if (dateKey !== todayDateKey) continue;

    const timeLabel = formatTimeLabel(eventDate, timeZone);
    const sortKey = eventDate.getTime();

    if (alert.status === SOS_ALERT_STATUS.resolved && alert.resolvedAt) {
      items.push({
        sortKey,
        timeLabel,
        title: copy.timelineResolved,
        variant: "default",
        href: copy.pedidosHref,
      });
      continue;
    }

    if (isOpenSosAlert(alert.status) || alert.status === SOS_ALERT_STATUS.cancelled) {
      items.push({
        sortKey,
        timeLabel,
        title: copy.timelineTriggered,
        variant: alert.status === SOS_ALERT_STATUS.cancelled ? "muted" : "warning",
        href: copy.pedidosHref,
      });
    }
  }

  return items;
}

function formatDateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function formatTimeLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function pickOpenAlert(
  alerts: OpenSosAlertSnapshot[],
): OpenSosAlertSnapshot | null {
  return alerts.find((alert) => isOpenSosAlert(alert.status)) ?? null;
}
