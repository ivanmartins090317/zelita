import { describe, expect, it } from "vitest";

import { computeAlertOpenCount, buildNoticesStat } from "./alert-open-count";
import {
  ALERT_FEED_STATUS,
  ALERT_FEED_TYPE,
} from "./alert-feed-types";
import { buildAlertFeedItem } from "./alert-feed-item";

describe("alert-open-count", () => {
  it("conta abertos e urgentes", () => {
    const items = [
      buildAlertFeedItem({
        id: "1",
        type: ALERT_FEED_TYPE.invitePending,
        status: ALERT_FEED_STATUS.open,
        sortKey: 1,
        occurredAt: "",
        title: "",
        subtitle: "",
        icon: "",
        iconTone: "default",
        href: null,
        linkLabel: null,
        sourceExists: true,
      }),
      buildAlertFeedItem({
        id: "2",
        type: ALERT_FEED_TYPE.sos,
        status: ALERT_FEED_STATUS.open,
        sortKey: 2,
        occurredAt: "",
        title: "",
        subtitle: "",
        icon: "",
        iconTone: "emergency",
        href: null,
        linkLabel: null,
        sourceExists: true,
      }),
      buildAlertFeedItem({
        id: "3",
        type: ALERT_FEED_TYPE.packRefill,
        status: ALERT_FEED_STATUS.resolved,
        sortKey: 3,
        occurredAt: "",
        title: "",
        subtitle: "",
        icon: "",
        iconTone: "warning",
        href: null,
        linkLabel: null,
        sourceExists: true,
      }),
    ];

    const summary = computeAlertOpenCount(items);
    expect(summary.totalOpen).toBe(2);
    expect(summary.urgentOpen).toBe(1);
    expect(summary.hasUrgent).toBe(true);
  });

  it("monta stat Hoje com hints", () => {
    const copy = {
      noneHint: "Tudo em dia",
      noneUrgentHint: "Nenhum é urgente",
      urgentHint: "Há pedido de ajuda aberto",
      attentionHint: "Confira os avisos",
    };

    expect(
      buildNoticesStat({
        summary: computeAlertOpenCount([]),
        copy,
      }).hint,
    ).toBe("Tudo em dia");

    expect(
      buildNoticesStat({
        summary: {
          totalOpen: 2,
          urgentOpen: 0,
          nonUrgentOpen: 2,
          hasUrgent: false,
        },
        copy,
      }).hint,
    ).toBe("Nenhum é urgente");

    expect(
      buildNoticesStat({
        summary: {
          totalOpen: 1,
          urgentOpen: 1,
          nonUrgentOpen: 0,
          hasUrgent: true,
        },
        copy,
      }).tone,
    ).toBe("critical");
  });
});
