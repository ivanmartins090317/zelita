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

  it("expõe copy de Pedidos de ajuda F4.7", () => {
    expect(familyContent.pedidosDeAjuda.disclaimer.samu).toContain("192");
    expect(familyContent.pedidosDeAjuda.lastAlert.resolveButton).toContain(
      "resolvido",
    );
    expect(familyContent.pedidosDeAjuda.escalation.title).toBeTruthy();
    expect(familyContent.pedidosDeAjuda.hoje.needsTitle).toContain("{apelido}");
    expect(familyContent.pedidosDeAjuda.detail.locationInsideZone).toContain(
      "{zona}",
    );
  });

  it("expõe copy de Localização F4.8", () => {
    expect(familyContent.localizacao.map.title).toBe("Onde ele está");
    expect(familyContent.localizacao.consent.footer).toBeTruthy();
    expect(familyContent.localizacao.limitations.paragraphs).toHaveLength(4);
    expect(familyContent.localizacao.sharePublic.expiredTitle).toBeTruthy();
  });

  it("expõe copy de Remédios F4.3", () => {
    expect(familyContent.remedios.listCard.title).toBe("Remédios que ele toma");
    expect(familyContent.remedios.modal.previewTitle).toContain("conta");
    expect(familyContent.remedios.howWeWrite.neverItems[0]).toContain("tomou");
    expect(familyContent.remedios.detail.actions.editScheduleSoon).toBe(
      "Em breve",
    );
  });

  it("expõe copy de Quem participa F4.4", () => {
    expect(familyContent.participantes.listCard.inviteButton).toBe(
      "+ Convidar pessoa",
    );
    expect(familyContent.participantes.matrix.title).toBe(
      "O que cada papel pode fazer",
    );
    expect(familyContent.participantes.feedback.validityNote).toContain("7 dias");
    expect(familyContent.participantes.modal.roles).toHaveLength(4);
  });

  it("expõe copy de Consultas e tarefas F4.5", () => {
    expect(familyContent.consultas.list.appointmentsTitle).toBe(
      "Próximas consultas",
    );
    expect(familyContent.consultas.list.tasksTitle).toBe("Tarefas da família");
    expect(familyContent.consultas.weekGrid.titleTemplate).toContain("{inicio}");
    expect(familyContent.consultas.appointmentModal.types).toHaveLength(4);
    expect(familyContent.consultas.appointmentModal.dateLabel).toBe("Data");
    expect(familyContent.consultas.appointmentModal.timeLabel).toBe("Horário");
    expect(familyContent.consultas.appointmentModal.timeOtherLabel).toBe(
      "Ou escolha outro horário",
    );
    expect(familyContent.consultas.taskModal.types).toHaveLength(4);
  });

  it("expõe copy principal de exames e receitas", () => {
    expect(familyContent.exames.table.addButton).toBe("+ Adicionar exame");
    expect(familyContent.exames.autoRead.tag).toBe("Depois do MVP");
    expect(familyContent.exames.hoje.needsTitle).toBe("Um exame sem categoria");
    expect(familyContent.exames.sharePublic.expiredTitle).toContain("expirado");
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
