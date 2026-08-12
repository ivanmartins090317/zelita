import { describe, expect, it } from "vitest";

import {
  familyContent,
  familyRoutes,
  formatChecklistProgress,
  formatFamilySubtitle,
  formatTrialBadge,
} from "./family";

describe("familyContent", () => {
  it("expõe onze destinos na ordem do protótipo", () => {
    const ids = familyContent.nav.flatMap((section) =>
      section.items.map((item) => item.id),
    );
    expect(ids).toEqual([
      "hoje",
      "remedios",
      "consultas",
      "avisos",
      "pedidos-de-ajuda",
      "localizacao",
      "exames",
      "guia",
      "participantes",
      "plano",
      "ajustes",
    ]);
  });

  it("mapeia rotas canônicas", () => {
    expect(familyRoutes.hoje).toBe("/familia");
    expect(familyRoutes.remedios).toBe("/familia/remedios");
    expect(familyRoutes.consultas).toBe("/familia/consultas");
    expect(familyRoutes.guia).toBe("/familia/guia");
    expect(familyRoutes.ajustes).toBe("/familia/ajustes");
  });

  it("tem copy de título e subtítulo para cada área", () => {
    for (const id of [
      "hoje",
      "remedios",
      "consultas",
      "avisos",
      "pedidos-de-ajuda",
      "localizacao",
      "exames",
      "guia",
      "participantes",
      "plano",
      "ajustes",
    ]) {
      expect(familyContent.areas[id]?.title).toBeTruthy();
      expect(familyContent.areas[id]?.subtitle).toBeTruthy();
    }
  });

  it("não menciona texto grande no topbar", () => {
    const serialized = JSON.stringify(familyContent.topbar).toLowerCase();
    expect(serialized).not.toContain("texto grande");
    expect(serialized).not.toContain("🔍");
  });

  it("não inclui toggle de protótipo conta em uso", () => {
    const serialized = JSON.stringify(familyContent).toLowerCase();
    expect(serialized).not.toContain("conta em uso");
  });

  it("expõe copy do Hoje / primeiro acesso", () => {
    expect(familyContent.hoje.checklistTasks).toHaveLength(4);
    expect(familyContent.hoje.welcomeModal.primary).toContain("painel");
    expect(familyContent.hoje.maduro.stats.locationValue).toBe("Em breve");
    expect(familyContent.hoje.maduro.stats.noticesValue).toBe("0");
  });

  it("expõe copy de Remédios F4.3", () => {
    expect(familyContent.remedios.listCard.title).toBe("Remédios que ele toma");
    expect(familyContent.remedios.modal.previewTitle).toContain("conta");
    expect(familyContent.remedios.howWeWrite.neverItems[0]).toContain("tomou");
    expect(familyContent.remedios.detail.actions.editScheduleSoon).toBe(
      "Em breve",
    );
  });
});

describe("formatChecklistProgress", () => {
  it("substitui contagem no template", () => {
    expect(formatChecklistProgress("{count} de 4 feitas", 2)).toBe(
      "2 de 4 feitas",
    );
  });
});

describe("formatFamilySubtitle", () => {
  it("substitui apelido no template", () => {
    expect(
      formatFamilySubtitle("Como está o dia do {apelido}", "Seu João"),
    ).toBe("Como está o dia do Seu João");
  });
});

describe("formatTrialBadge", () => {
  it("monta badge do trial", () => {
    expect(formatTrialBadge("Dia {current} de {total}", 1, 30)).toBe(
      "Dia 1 de 30",
    );
  });
});
