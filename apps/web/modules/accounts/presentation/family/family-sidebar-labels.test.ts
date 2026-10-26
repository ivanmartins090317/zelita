import { describe, expect, it } from "vitest";

import { listFamilyNavItems } from "./family-nav";
import { familyNavIcons } from "./family-nav-icons";
import {
  formatNavCountSuffix,
  formatSidebarPlanBadge,
  resolveNavBadgeCount,
} from "./family-sidebar-labels";

describe("formatSidebarPlanBadge", () => {
  it("mostra o plano real e prioriza conta pausada", () => {
    expect(formatSidebarPlanBadge("essential", false)).toBe("Essencial");
    expect(formatSidebarPlanBadge("cuidado_plus", false)).toBe("Cuidado+");
    expect(formatSidebarPlanBadge("cuidado_plus", true)).toBe("Pausado");
    expect(formatSidebarPlanBadge("desconhecido", false)).toBe("Essencial");
  });
});

describe("formatNavCountSuffix", () => {
  it("explica a contagem sem depender só do número", () => {
    expect(formatNavCountSuffix("remedios", 1)).toBe("1 ativo");
    expect(formatNavCountSuffix("remedios", 4)).toBe("4 ativos");
    expect(formatNavCountSuffix("avisos", 1)).toBe("1 em aberto");
    expect(formatNavCountSuffix("avisos", 4)).toBe("4 em aberto");
  });
});

describe("resolveNavBadgeCount", () => {
  it("só conta remédios ativos e avisos em aberto", () => {
    expect(
      resolveNavBadgeCount({
        itemId: "remedios",
        activeMedicationCount: 4,
        openAlertsCount: 2,
      }),
    ).toBe(4);
    expect(
      resolveNavBadgeCount({
        itemId: "avisos",
        activeMedicationCount: 4,
        openAlertsCount: 0,
      }),
    ).toBeNull();
    expect(
      resolveNavBadgeCount({
        itemId: "hoje",
        activeMedicationCount: 4,
        openAlertsCount: 3,
      }),
    ).toBeNull();
  });
});

describe("familyNavIcons", () => {
  it("cobre cada destino do menu", () => {
    const ids = listFamilyNavItems().map((item) => item.id).sort();
    expect(Object.keys(familyNavIcons).sort()).toEqual(ids);
  });
});
