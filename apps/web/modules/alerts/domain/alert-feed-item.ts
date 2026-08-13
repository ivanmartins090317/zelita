import {
  ALERT_FEED_STATUS,
  ALERT_FEED_TYPE,
  type AlertFeedFilter,
  type AlertFeedStatus,
  type AlertFeedType,
  canViewAlertTypeForRole,
  FEED_PAGE_SIZE,
  FEED_RETENTION_DAYS,
  matchesFeedFilter,
} from "./alert-feed-types";

export interface AlertFeedItemInput {
  id: string;
  type: AlertFeedType;
  status: AlertFeedStatus;
  sortKey: number;
  occurredAt: string;
  title: string;
  subtitle: string;
  icon: string;
  iconTone: "default" | "warning" | "emergency" | "muted";
  href: string | null;
  linkLabel: string | null;
  sourceExists: boolean;
}

export interface AlertFeedItem extends AlertFeedItemInput {
  isResolved: boolean;
}

export function buildAlertFeedItem(input: AlertFeedItemInput): AlertFeedItem {
  return {
    ...input,
    isResolved: input.status === ALERT_FEED_STATUS.resolved,
  };
}

export function sortFeedItems(items: AlertFeedItem[]): AlertFeedItem[] {
  return [...items].sort((a, b) => b.sortKey - a.sortKey);
}

export function filterFeedItems(input: {
  items: AlertFeedItem[];
  filter: AlertFeedFilter;
  role: import("@/modules/accounts/domain/roles").AccountRole;
}): AlertFeedItem[] {
  return input.items.filter(
    (item) =>
      matchesFeedFilter(item.type, input.filter) &&
      canViewAlertTypeForRole(input.role, item.type),
  );
}

export function paginateFeedItems(
  items: AlertFeedItem[],
  limit = FEED_PAGE_SIZE,
  offset = 0,
): { items: AlertFeedItem[]; hasMore: boolean; total: number } {
  const slice = items.slice(offset, offset + limit);
  return {
    items: slice,
    hasMore: offset + limit < items.length,
    total: items.length,
  };
}

export function applyRetentionPolicy(
  items: AlertFeedItem[],
  now: Date,
): AlertFeedItem[] {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - FEED_RETENTION_DAYS);
  const cutoffMs = cutoff.getTime();

  return items.filter((item) => {
    if (item.status === ALERT_FEED_STATUS.open) return true;
    return item.sortKey >= cutoffMs;
  });
}

export function resolveFeedItemFromRemovedSource(
  item: AlertFeedItem,
  removedSubtitle: string,
): AlertFeedItem | null {
  if (!item.sourceExists) return null;
  return {
    ...item,
    sourceExists: false,
    subtitle: removedSubtitle,
    href: null,
    linkLabel: null,
  };
}

export function isOpenFeedItem(item: AlertFeedItem): boolean {
  return item.status === ALERT_FEED_STATUS.open;
}

export function isUrgentOpenItem(item: AlertFeedItem): boolean {
  return isOpenFeedItem(item) && item.type === ALERT_FEED_TYPE.sos;
}

export const OPEN_STATUS_TYPES = [
  ALERT_FEED_TYPE.packRefill,
  ALERT_FEED_TYPE.packLastDay,
  ALERT_FEED_TYPE.reminderUnread,
  ALERT_FEED_TYPE.sos,
  ALERT_FEED_TYPE.zoneExit,
  ALERT_FEED_TYPE.invitePending,
  ALERT_FEED_TYPE.examUncategorized,
] as const;
