import { describe, expect, it } from "vitest";

import { SOS_ALERT_STATUS } from "./sos-alert-status";
import {
  buildOpenAlertNeedsItem,
  buildSosTimelineItems,
  mergeSosNeedsItems,
  pickOpenAlert,
  SOS_NEEDS_SORT_KEY,
} from "./sos-hoje-priority";

describe("sos-hoje-priority", () => {
  const copy = {
    needsTitle: "{apelido} pediu ajuda",
    needsSubtitle: "Acionado às {horario}",
    timelineTriggered: "Botão de ajuda acionado",
    timelineResolved: "Pedido de ajuda resolvido",
    pedidosHref: "/familia/pedidos-de-ajuda",
  };

  it("prioriza SOS acima de refill", () => {
    const sosItem = buildOpenAlertNeedsItem(
      {
        id: "a1",
        status: SOS_ALERT_STATUS.open,
        triggeredAt: new Date(),
        careRecipientDisplayName: "Seu João",
      },
      "19:42",
      copy,
    );
    expect(sosItem.sortKey).toBe(SOS_NEEDS_SORT_KEY);
    expect(sosItem.title).toContain("Seu João");

    const merged = mergeSosNeedsItems(
      [{ id: "refill-1", kind: "refill", sortKey: 0, title: "x", subtitle: "y", icon: "💊" }],
      [sosItem],
    );
    expect(merged[0]?.id).toBe("sos-open-a1");
  });

  it("inclui acionamento de hoje na timeline", () => {
    const today = new Date("2026-08-13T14:30:00-03:00");
    const items = buildSosTimelineItems(
      [
        {
          id: "1",
          status: SOS_ALERT_STATUS.open,
          triggeredAt: today,
          resolvedAt: null,
        },
      ],
      "2026-08-13",
      "America/Sao_Paulo",
      copy,
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe(copy.timelineTriggered);
    expect(items[0]?.variant).toBe("warning");
  });

  it("seleciona alerta aberto", () => {
    const open = pickOpenAlert([
      {
        id: "1",
        status: SOS_ALERT_STATUS.resolved,
        triggeredAt: new Date(),
        careRecipientDisplayName: "João",
      },
      {
        id: "2",
        status: SOS_ALERT_STATUS.open,
        triggeredAt: new Date(),
        careRecipientDisplayName: "João",
      },
    ]);
    expect(open?.id).toBe("2");
  });
});
