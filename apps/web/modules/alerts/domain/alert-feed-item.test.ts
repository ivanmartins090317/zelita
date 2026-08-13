import { describe, expect, it } from "vitest";

import {
  ALERT_FEED_STATUS,
  ALERT_FEED_TYPE,
} from "./alert-feed-types";
import {
  applyRetentionPolicy,
  buildAlertFeedItem,
  filterFeedItems,
  paginateFeedItems,
  sortFeedItems,
} from "./alert-feed-item";
import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

function sampleItem(
  overrides: Partial<Parameters<typeof buildAlertFeedItem>[0]> = {},
) {
  return buildAlertFeedItem({
    id: "1",
    type: ALERT_FEED_TYPE.packRefill,
    status: ALERT_FEED_STATUS.open,
    sortKey: Date.now(),
    occurredAt: new Date().toISOString(),
    title: "Teste",
    subtitle: "Sub",
    icon: "💊",
    iconTone: "warning",
    href: null,
    linkLabel: null,
    sourceExists: true,
    ...overrides,
  });
}

describe("alert-feed-item", () => {
  it("ordena por mais recente", () => {
    const items = sortFeedItems([
      sampleItem({ id: "a", sortKey: 100 }),
      sampleItem({ id: "b", sortKey: 300 }),
      sampleItem({ id: "c", sortKey: 200 }),
    ]);
    expect(items.map((item) => item.id)).toEqual(["b", "c", "a"]);
  });

  it("filtra por chip e papel", () => {
    const items = [
      sampleItem({ id: "sos", type: ALERT_FEED_TYPE.sos }),
      sampleItem({ id: "invite", type: ALERT_FEED_TYPE.invitePending }),
    ];
    const filtered = filterFeedItems({
      items,
      filter: "emergency",
      role: ACCOUNT_ROLES.admin,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("sos");
  });

  it("pagina em lotes de 50", () => {
    const items = Array.from({ length: 55 }, (_, index) =>
      sampleItem({ id: String(index), sortKey: index }),
    );
    const page = paginateFeedItems(items, 50, 0);
    expect(page.items).toHaveLength(50);
    expect(page.hasMore).toBe(true);
    expect(page.total).toBe(55);
  });

  it("mantém abertos e resolvidos recentes na retenção", () => {
    const now = new Date("2026-08-13T12:00:00Z");
    const recent = sampleItem({
      status: ALERT_FEED_STATUS.resolved,
      sortKey: now.getTime() - 1_000,
    });
    const old = sampleItem({
      id: "old",
      status: ALERT_FEED_STATUS.resolved,
      sortKey: new Date("2026-01-01").getTime(),
    });
    const open = sampleItem({ id: "open", status: ALERT_FEED_STATUS.open });

    const kept = applyRetentionPolicy([recent, old, open], now);
    expect(kept.map((item) => item.id)).toEqual(["1", "open"]);
  });
});
