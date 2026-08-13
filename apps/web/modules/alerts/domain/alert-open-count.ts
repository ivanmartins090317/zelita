import type { AlertFeedItem } from "./alert-feed-item";
import { isOpenFeedItem, isUrgentOpenItem } from "./alert-feed-item";

export interface AlertOpenCountSummary {
  totalOpen: number;
  urgentOpen: number;
  nonUrgentOpen: number;
  hasUrgent: boolean;
}

export function computeAlertOpenCount(
  items: AlertFeedItem[],
): AlertOpenCountSummary {
  const openItems = items.filter(isOpenFeedItem);
  const urgentOpen = openItems.filter(isUrgentOpenItem).length;
  const totalOpen = openItems.length;

  return {
    totalOpen,
    urgentOpen,
    nonUrgentOpen: totalOpen - urgentOpen,
    hasUrgent: urgentOpen > 0,
  };
}

export interface NoticesStatViewModel {
  value: string;
  hint: string;
  tone: "default" | "warning" | "critical";
}

export function buildNoticesStat(input: {
  summary: AlertOpenCountSummary;
  copy: {
    noneHint: string;
    noneUrgentHint: string;
    urgentHint: string;
    attentionHint: string;
  };
}): NoticesStatViewModel {
  const { summary, copy } = input;

  if (summary.totalOpen === 0) {
    return {
      value: "0",
      hint: copy.noneHint,
      tone: "default",
    };
  }

  if (summary.hasUrgent) {
    return {
      value: String(summary.totalOpen),
      hint: copy.urgentHint,
      tone: "critical",
    };
  }

  if (summary.nonUrgentOpen > 0) {
    return {
      value: String(summary.totalOpen),
      hint: copy.noneUrgentHint,
      tone: "default",
    };
  }

  return {
    value: String(summary.totalOpen),
    hint: copy.attentionHint,
    tone: "warning",
  };
}
