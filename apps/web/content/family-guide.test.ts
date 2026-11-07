import { describe, expect, it } from "vitest";

import { familyContent } from "./family";
import {
  FAMILY_GUIDE_NAME,
  buildFamilyGuideBalloonBody,
  familyGuideBalloon,
  familyGuidePage,
  familyGuideSteps,
  familyGuideTargetIds,
  formatFamilyGuideProgress,
  selectFamilyGuideSteps,
} from "./family-guide";

const EXAMPLE_MEDICATIONS = [
  "Losartana",
  "Metformina",
  "Sinvastatina",
  "Dipirona",
];

const STEP_TITLES = [
  "Quem você acompanha",
  "Hoje",
  "Remédios",
  "Consultas e tarefas",
  "Avisos",
  "Pedidos de ajuda",
  "Onde ele está",
  "Exames e receitas",
  "Quem participa",
  "Meu plano",
  "Ajustes",
  "Se esquecer",
  "Atalhos",
];

function allTargetIds(): Set<string> {
  return new Set(familyGuideSteps.map((step) => step.targetId));
}

describe("family guide", () => {
  it("lista 13 passos na ordem fixa", () => {
    const steps = selectFamilyGuideSteps(allTargetIds());

    expect(steps).toHaveLength(13);
    expect(steps.map((step) => step.title)).toEqual(STEP_TITLES);
    expect(steps.map((step) => step.targetId)).toEqual([
      familyGuideTargetIds.recipient,
      familyGuideTargetIds.hoje,
      familyGuideTargetIds.remedios,
      familyGuideTargetIds.consultas,
      familyGuideTargetIds.avisos,
      familyGuideTargetIds.pedidosDeAjuda,
      familyGuideTargetIds.localizacao,
      familyGuideTargetIds.exames,
      familyGuideTargetIds.participantes,
      familyGuideTargetIds.plano,
      familyGuideTargetIds.ajustes,
      familyGuideTargetIds.guia,
      familyGuideTargetIds.shortcuts,
    ]);
    expect(formatFamilyGuideProgress(1, steps.length)).toBe("Passo 1 de 13");
    expect(formatFamilyGuideProgress(13, steps.length)).toBe("Passo 13 de 13");
  });

  it("omite o atalho do topo quando o alvo não entra", () => {
    const available = allTargetIds();
    available.delete(familyGuideTargetIds.shortcuts);

    const steps = selectFamilyGuideSteps(available);

    expect(steps).toHaveLength(12);
    expect(steps.at(-1)?.title).toBe("Se esquecer");
    expect(steps.some((step) => step.targetId === familyGuideTargetIds.shortcuts)).toBe(
      false,
    );
    expect(formatFamilyGuideProgress(steps.length, steps.length)).toBe(
      "Passo 12 de 12",
    );
  });

  it("mantém a ordem quando um alvo do meio não entra", () => {
    const available = allTargetIds();
    available.delete(familyGuideTargetIds.avisos);

    const steps = selectFamilyGuideSteps(available);

    expect(steps.map((step) => step.title)).toEqual(
      STEP_TITLES.filter((title) => title !== "Avisos"),
    );
  });

  it("usa o rótulo Como usar a Zelita nos botões que começam o caminho e no menu", () => {
    expect(FAMILY_GUIDE_NAME).toBe("Como usar a Zelita");
    expect(familyContent.topbar.tourLabel).toBe(FAMILY_GUIDE_NAME);
    expect(familyContent.hoje.primeiroAcesso.tourPrimary).toBe(FAMILY_GUIDE_NAME);
    expect(familyContent.hoje.maduro.centralTour).toBe(FAMILY_GUIDE_NAME);
    expect(familyContent.hoje.welcomeModal.primary).toBe(FAMILY_GUIDE_NAME);
    expect(
      familyContent.nav
        .flatMap((section) => section.items)
        .find((item) => item.id === "guia")?.label,
    ).toBe(FAMILY_GUIDE_NAME);
    expect(familyContent.hoje.primeiroAcesso.tourSecondary).toBe(
      "Prefiro ler no meu tempo",
    );
    expect(familyContent.hoje.welcomeModal.secondary).toBe(
      "Prefiro explorar sozinha",
    );
  });

  it("rotula o balão em português", () => {
    expect(familyGuideBalloon).toEqual({
      back: "Voltar",
      next: "Próximo",
      skip: "Sair",
      done: "Entendi",
    });

    const body = buildFamilyGuideBalloonBody(familyGuideSteps[0]!, 1, 13);
    expect(body).toContain("Passo 1 de 13");
    expect(body).toContain(familyGuideSteps[0]!.body);
    expect(body).not.toContain("<script");
  });

  it("não cita remédio de exemplo nem a palavra Tour", () => {
    const serialized = JSON.stringify({
      name: FAMILY_GUIDE_NAME,
      steps: familyGuideSteps,
      page: familyGuidePage,
      balloon: familyGuideBalloon,
    });

    expect(serialized).not.toMatch(/tour/i);
    for (const medication of EXAMPLE_MEDICATIONS) {
      expect(serialized).not.toContain(medication);
    }

    const stepText = familyGuideSteps.map((step) => `${step.title} ${step.body}`).join(" ");
    expect(stepText).not.toMatch(/João|Maria|Ana Souza/);
    expect(familyGuideSteps[2]?.body).toContain(
      "Lembrete enviado não quer dizer que o remédio foi tomado.",
    );
    expect(familyGuideSteps[5]?.body).toContain("não chama o SAMU");
    expect(familyGuideSteps[5]?.body).toContain("192");
  });

  it("explica a página na ordem combinada", () => {
    expect(familyGuidePage.noteLead).toBe(
      "Esta página existe para você não precisar adivinhar nada.",
    );
    expect(familyGuidePage.noteBody).toContain(FAMILY_GUIDE_NAME);
    expect(familyGuidePage.cards.map((card) => card.title)).toEqual([
      "Remédios",
      "Pedidos de ajuda",
      "Onde ele está",
      "Exames e receitas",
      "Quem participa",
      "Avisos",
      "Hoje",
      "Consultas e tarefas",
      "Meu plano",
      "Ajustes",
    ]);
    expect(familyGuidePage.cards[0]?.tip?.text).toContain("se necessário");
    expect(familyGuidePage.cards[1]?.tip?.text).toContain("192 ou 193");
    expect(familyGuidePage.cards[2]?.tip?.text).toContain("80 metros");
    expect(familyGuidePage.cards[4]?.roles?.map((role) => role.title)).toEqual([
      "Administrador",
      "Cuidador",
      "Visualizador",
      "Contato de emergência",
    ]);
    expect(familyGuidePage.cards[5]?.tip?.text).toContain("lembrete enviado");
    expect(familyGuidePage.questions.map((item) => item.question)).toEqual([
      "Meu pai precisa instalar algo?",
      "Ele precisa confirmar que tomou o remédio?",
      "Ele vai saber que estou vendo onde ele está?",
      "Vou ser cobrada quando os 30 dias acabarem?",
      "E se ele receber uma mensagem pedindo cartão?",
    ]);
    expect(familyGuidePage.questions[3]?.answer).toContain("90 dias");
    expect(familyGuidePage.questions).toHaveLength(5);
  });
});
