import { familyContent, familyRoutes } from "@/content/family";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  buildOpenAlertNeedsItem,
  buildSosTimelineItems,
  mergeSosNeedsItems,
  pickOpenAlert,
} from "../domain/sos-hoje-priority";
import { parseSosAlertStatus } from "../domain/sos-alert-status";
import { fetchSosAlertsForCareRecipient } from "../infrastructure/sos-alert-repo";
import { countSosEscalationContacts } from "../infrastructure/sos-escalation-repo";

const TIME_ZONE = "America/Sao_Paulo";

export interface HojeSosSnapshot {
  escalationContactCount: number;
  needsItems: ReturnType<typeof buildOpenAlertNeedsItem>[];
  timelineItems: ReturnType<typeof buildSosTimelineItems>;
}

function formatTodayDateKey(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function formatTimeLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export async function getHojeSosSnapshot(input: {
  careRecipientId: string;
  careRecipientDisplayName: string;
  now?: Date;
}): Promise<HojeSosSnapshot> {
  const copy = familyContent.pedidosDeAjuda.hoje;
  const now = input.now ?? new Date();
  const supabase = await createSupabaseServerClient();

  const [alerts, escalationContactCount] = await Promise.all([
    fetchSosAlertsForCareRecipient(supabase, input.careRecipientId, 50),
    countSosEscalationContacts(supabase, input.careRecipientId),
  ]);

  const openSnapshots = alerts
    .map((alert) => {
      const status = parseSosAlertStatus(alert.status);
      if (!status) return null;
      return {
        id: alert.id,
        status,
        triggeredAt: new Date(alert.triggeredAt),
        careRecipientDisplayName: input.careRecipientDisplayName,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const openAlert = pickOpenAlert(openSnapshots);
  const needsItems = openAlert
    ? [
        buildOpenAlertNeedsItem(
          openAlert,
          formatTimeLabel(openAlert.triggeredAt, TIME_ZONE),
          {
            needsTitle: copy.needsTitle,
            needsSubtitle: copy.needsSubtitle,
            timelineTriggered: copy.timelineTriggered,
            timelineResolved: copy.timelineResolved,
            pedidosHref: familyRoutes.pedidosDeAjuda,
          },
        ),
      ]
    : [];

  const timelineItems = buildSosTimelineItems(
    alerts.map((alert) => ({
      id: alert.id,
      status: alert.status,
      triggeredAt: new Date(alert.triggeredAt),
      resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
    })),
    formatTodayDateKey(now, TIME_ZONE),
    TIME_ZONE,
    {
      needsTitle: copy.needsTitle,
      needsSubtitle: copy.needsSubtitle,
      timelineTriggered: copy.timelineTriggered,
      timelineResolved: copy.timelineResolved,
      pedidosHref: familyRoutes.pedidosDeAjuda,
    },
  );

  return {
    escalationContactCount,
    needsItems,
    timelineItems,
  };
}

export { mergeSosNeedsItems };
