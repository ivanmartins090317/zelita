import { familyContent } from "@/content/family";
import type { ActivityFeedItem, TimelineItem } from "@/modules/medications/domain/hoje-timeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { buildAlertFeedFromSources } from "./build-alert-feed";
import { ALERT_FEED_TYPE } from "../domain/alert-feed-types";
import { computeAlertOpenCount, buildNoticesStat } from "../domain/alert-open-count";
import type { NoticesStatViewModel } from "../domain/alert-open-count";
import { fetchAlertFeedSources } from "../infrastructure/alert-feed-sources-repo";

export interface HojeAlertsSnapshot {
  openCount: number;
  noticesStat: NoticesStatViewModel;
  activityItems: ActivityFeedItem[];
  timelineItems: TimelineItem[];
}

const ACTIVITY_LIMIT = 5;

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}

export async function getHojeAlertsSnapshot(input: {
  careRecipientId: string;
  accountId: string;
  now?: Date;
}): Promise<HojeAlertsSnapshot> {
  const now = input.now ?? new Date();
  const copy = familyContent.avisos.hoje;
  const feedCopy = familyContent.avisos.feed;

  const supabase = await createSupabaseServerClient();
  const sources = await fetchAlertFeedSources(supabase, {
    careRecipientId: input.careRecipientId,
    accountId: input.accountId,
    now,
  });

  const feedItems = buildAlertFeedFromSources({
    sources,
    copy: feedCopy,
    now,
  });

  const summary = computeAlertOpenCount(feedItems);
  const noticesStat = buildNoticesStat({
    summary,
    copy: {
      noneHint: copy.noticesNoneHint,
      noneUrgentHint: copy.noticesNoneUrgentHint,
      urgentHint: copy.noticesUrgentHint,
      attentionHint: copy.noticesAttentionHint,
    },
  });

  const activityCandidates = feedItems
    .filter(
      (item) =>
        item.type === ALERT_FEED_TYPE.invitePending ||
        item.type === ALERT_FEED_TYPE.examUncategorized,
    )
    .slice(0, ACTIVITY_LIMIT);

  const activityItems: ActivityFeedItem[] = activityCandidates.map((item) => {
    if (item.type === ALERT_FEED_TYPE.invitePending) {
      const name =
        item.subtitle.match(/([^·]+)/)?.[0]?.trim() ??
        item.subtitle.replace(" ainda não entrou na conta", "");
      return {
        id: item.id,
        initials: buildInitials(name),
        title: copy.activityInvite.replace("{nome}", name),
        subtitle: item.subtitle,
        sortKey: item.sortKey,
      };
    }

    return {
      id: item.id,
      initials: "📄",
      title: copy.activityExam.replace("{titulo}", item.subtitle.split(" ")[0] ?? "Exame"),
      subtitle: item.subtitle,
      sortKey: item.sortKey,
    };
  });

  const timelineItems: TimelineItem[] = feedItems
    .filter(
      (item) =>
        item.type === ALERT_FEED_TYPE.sos ||
        item.type === ALERT_FEED_TYPE.zoneExit,
    )
    .slice(0, 5)
    .map((item) => ({
      sortKey: item.sortKey,
      timeLabel: new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Sao_Paulo",
      }).format(new Date(item.occurredAt)),
      title: item.title,
      subtitle: item.subtitle,
      variant: item.type === ALERT_FEED_TYPE.sos ? "warning" : "default",
      href: item.href ?? undefined,
      linkLabel: item.linkLabel ?? undefined,
    }));

  return {
    openCount: summary.totalOpen,
    noticesStat,
    activityItems,
    timelineItems,
  };
}
