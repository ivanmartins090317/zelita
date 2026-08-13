import { familyRoutes } from "@/content/family";
import { GEOFENCE_EVENT_TYPE } from "@/modules/location/domain/location-history-labels";
import { SOS_ALERT_STATUS } from "@/modules/sos/domain/sos-alert-status";

import {
  ALERT_FEED_STATUS,
  ALERT_FEED_TYPE,
} from "../domain/alert-feed-types";
import {
  applyRetentionPolicy,
  buildAlertFeedItem,
  sortFeedItems,
  type AlertFeedItem,
} from "../domain/alert-feed-item";
import type { AlertFeedSourcesSnapshot } from "../infrastructure/alert-feed-sources-repo";

const TIME_ZONE = "America/Sao_Paulo";

export interface AlertFeedCopy {
  packRefillTitle: string;
  packRefillSubtitle: string;
  packLastDayTitle: string;
  reminderUnreadTitle: string;
  reminderUnreadSubtitle: string;
  sosTitle: string;
  sosSubtitleOpen: string;
  sosSubtitleResolved: string;
  zoneExitTitle: string;
  zoneExitSubtitleOpen: string;
  zoneExitSubtitleResolved: string;
  inviteTitle: string;
  inviteSubtitle: string;
  examTitle: string;
  examSubtitle: string;
  removedSource: string;
  linkView: string;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function formatEndDate(iso: string): string {
  return iso.split("-").reverse().join("/");
}

export function buildAlertFeedFromSources(input: {
  sources: AlertFeedSourcesSnapshot;
  copy: AlertFeedCopy;
  now: Date;
}): AlertFeedItem[] {
  const items: AlertFeedItem[] = [];
  const seenMedicationRefill = new Set<string>();

  for (const refill of input.sources.refills) {
    seenMedicationRefill.add(refill.medicationId);
    const endLabel = formatEndDate(refill.endDateEstimated);
    items.push(
      buildAlertFeedItem({
        id: `refill-open-${refill.medicationId}`,
        type: ALERT_FEED_TYPE.packRefill,
        status: ALERT_FEED_STATUS.open,
        sortKey: input.now.getTime(),
        occurredAt: input.now.toISOString(),
        title: input.copy.packRefillTitle,
        subtitle: input.copy.packRefillSubtitle
          .replace("{nome}", refill.medicationName)
          .replace("{dose}", refill.dosageLabel)
          .replace("{fim}", endLabel)
          .replace("{dias}", String(refill.daysRemaining)),
        icon: "💊",
        iconTone: "warning",
        href: familyRoutes.remedios,
        linkLabel: null,
        sourceExists: true,
      }),
    );
  }

  for (const event of input.sources.medicationEvents) {
    if (!event.medicationId) continue;

    if (event.type === "pack_refill_warning") {
      if (seenMedicationRefill.has(event.medicationId)) continue;
      items.push(
        buildAlertFeedItem({
          id: `refill-event-${event.id}`,
          type: ALERT_FEED_TYPE.packRefill,
          status: ALERT_FEED_STATUS.resolved,
          sortKey: new Date(event.createdAt).getTime(),
          occurredAt: event.createdAt,
          title: input.copy.packRefillTitle,
          subtitle: event.medicationName ?? input.copy.removedSource,
          icon: "💊",
          iconTone: "muted",
          href: familyRoutes.remedios,
          linkLabel: null,
          sourceExists: Boolean(event.medicationName),
        }),
      );
    }

    if (event.type === "pack_last_day") {
      items.push(
        buildAlertFeedItem({
          id: `last-day-${event.id}`,
          type: ALERT_FEED_TYPE.packLastDay,
          status: ALERT_FEED_STATUS.resolved,
          sortKey: new Date(event.createdAt).getTime(),
          occurredAt: event.createdAt,
          title: input.copy.packLastDayTitle,
          subtitle: event.medicationName ?? input.copy.removedSource,
          icon: "💊",
          iconTone: "warning",
          href: familyRoutes.remedios,
          linkLabel: null,
          sourceExists: Boolean(event.medicationName),
        }),
      );
    }

    if (event.type === "voice_fallback") {
      items.push(
        buildAlertFeedItem({
          id: `reminder-${event.id}`,
          type: ALERT_FEED_TYPE.reminderUnread,
          status: ALERT_FEED_STATUS.resolved,
          sortKey: new Date(event.createdAt).getTime(),
          occurredAt: event.createdAt,
          title: input.copy.reminderUnreadTitle,
          subtitle: input.copy.reminderUnreadSubtitle.replace(
            "{hora}",
            formatTime(event.createdAt),
          ),
          icon: "✓",
          iconTone: "muted",
          href: familyRoutes.remedios,
          linkLabel: null,
          sourceExists: true,
        }),
      );
    }
  }

  for (const alert of input.sources.sosAlerts) {
    const isOpen = alert.status === SOS_ALERT_STATUS.open;
    let subtitle = input.copy.sosSubtitleOpen;
    if (!isOpen && alert.resolvedAt && alert.resolvedByName) {
      subtitle = input.copy.sosSubtitleResolved
        .replace("{data}", formatDate(alert.triggeredAt))
        .replace("{hora}", formatTime(alert.triggeredAt))
        .replace("{nome}", alert.resolvedByName)
        .replace("{horaResolucao}", formatTime(alert.resolvedAt));
    } else if (!isOpen) {
      subtitle = `${formatDate(alert.triggeredAt)} às ${formatTime(alert.triggeredAt)}`;
    }

    items.push(
      buildAlertFeedItem({
        id: `sos-${alert.id}`,
        type: ALERT_FEED_TYPE.sos,
        status: isOpen ? ALERT_FEED_STATUS.open : ALERT_FEED_STATUS.resolved,
        sortKey: new Date(alert.triggeredAt).getTime(),
        occurredAt: alert.triggeredAt,
        title: input.copy.sosTitle,
        subtitle,
        icon: "SOS",
        iconTone: "emergency",
        href: `${familyRoutes.pedidosDeAjuda}?alerta=${alert.id}`,
        linkLabel: input.copy.linkView,
        sourceExists: true,
      }),
    );
  }

  const zoneExits = input.sources.zoneEvents.filter(
    (event) => event.eventType === GEOFENCE_EVENT_TYPE.zoneExit,
  );

  for (const exitEvent of zoneExits) {
    const returnEvent = input.sources.zoneEvents.find(
      (event) =>
        event.eventType === GEOFENCE_EVENT_TYPE.zoneReturn &&
        event.placeName === exitEvent.placeName &&
        new Date(event.recordedAt).getTime() >
          new Date(exitEvent.recordedAt).getTime(),
    );

    const isOpen = !returnEvent;
    let subtitle = input.copy.zoneExitSubtitleOpen
      .replace("{data}", formatDate(exitEvent.recordedAt))
      .replace("{hora}", formatTime(exitEvent.recordedAt))
      .replace("{lugar}", exitEvent.placeName);

    if (returnEvent) {
      subtitle = input.copy.zoneExitSubtitleResolved
        .replace("{data}", formatDate(exitEvent.recordedAt))
        .replace("{hora}", formatTime(exitEvent.recordedAt))
        .replace("{lugar}", exitEvent.placeName)
        .replace("{horaRetorno}", formatTime(returnEvent.recordedAt));
    }

    items.push(
      buildAlertFeedItem({
        id: `zone-${exitEvent.id}`,
        type: ALERT_FEED_TYPE.zoneExit,
        status: isOpen ? ALERT_FEED_STATUS.open : ALERT_FEED_STATUS.resolved,
        sortKey: new Date(exitEvent.recordedAt).getTime(),
        occurredAt: exitEvent.recordedAt,
        title: input.copy.zoneExitTitle,
        subtitle,
        icon: "📍",
        iconTone: isOpen ? "warning" : "muted",
        href: familyRoutes.localizacao,
        linkLabel: isOpen ? null : input.copy.linkView,
        sourceExists: true,
      }),
    );
  }

  for (const invite of input.sources.pendingInvites) {
    items.push(
      buildAlertFeedItem({
        id: `invite-${invite.id}`,
        type: ALERT_FEED_TYPE.invitePending,
        status: ALERT_FEED_STATUS.open,
        sortKey: new Date(invite.createdAt).getTime(),
        occurredAt: invite.createdAt,
        title: input.copy.inviteTitle,
        subtitle: input.copy.inviteSubtitle.replace("{nome}", invite.displayName),
        icon: "👤",
        iconTone: "default",
        href: familyRoutes.participantes,
        linkLabel: input.copy.linkView,
        sourceExists: true,
      }),
    );
  }

  for (const exam of input.sources.uncategorizedExams) {
    items.push(
      buildAlertFeedItem({
        id: `exam-${exam.id}`,
        type: ALERT_FEED_TYPE.examUncategorized,
        status: ALERT_FEED_STATUS.open,
        sortKey: new Date(exam.examDate).getTime(),
        occurredAt: exam.examDate,
        title: input.copy.examTitle,
        subtitle: input.copy.examSubtitle
          .replace("{titulo}", exam.title)
          .replace("{data}", formatEndDate(exam.examDate)),
        icon: "📄",
        iconTone: "default",
        href: `${familyRoutes.exames}?exame=${exam.id}`,
        linkLabel: input.copy.linkView,
        sourceExists: true,
      }),
    );
  }

  const retained = applyRetentionPolicy(items, input.now);
  return sortFeedItems(
    retained.map((item) =>
      item.sourceExists
        ? item
        : {
            ...item,
            subtitle: input.copy.removedSource,
            href: null,
            linkLabel: null,
          },
    ),
  );
}
