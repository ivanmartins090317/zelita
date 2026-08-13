import { describe, expect, it } from "vitest";

import { familyContent } from "@/content/family";
import { buildAlertFeedFromSources } from "@/modules/alerts/application/build-alert-feed";
import type { AlertFeedSourcesSnapshot } from "@/modules/alerts/infrastructure/alert-feed-sources-repo";

const emptySources: AlertFeedSourcesSnapshot = {
  refills: [],
  medicationEvents: [],
  sosAlerts: [],
  zoneEvents: [],
  pendingInvites: [],
  uncategorizedExams: [],
};

describe("buildAlertFeedFromSources", () => {
  it("retorna vazio sem dados inventados", () => {
    const items = buildAlertFeedFromSources({
      sources: emptySources,
      copy: familyContent.avisos.feed,
      now: new Date("2026-08-13T12:00:00Z"),
    });
    expect(items).toHaveLength(0);
  });

  it("agrega convite pendente e exame sem categoria", () => {
    const items = buildAlertFeedFromSources({
      sources: {
        ...emptySources,
        pendingInvites: [
          {
            id: "inv-1",
            displayName: "Marcelo",
            createdAt: "2026-08-10T10:00:00Z",
            status: "pending",
          },
        ],
        uncategorizedExams: [
          {
            id: "exam-1",
            title: "Hemograma",
            examDate: "2026-08-02",
            category: null,
          },
        ],
      },
      copy: familyContent.avisos.feed,
      now: new Date("2026-08-13T12:00:00Z"),
    });

    expect(items).toHaveLength(2);
    expect(items.some((item) => item.id === "invite-inv-1")).toBe(true);
    expect(items.some((item) => item.id === "exam-exam-1")).toBe(true);
  });
});
