import { describe, expect, it } from "vitest";

import { elderContent, elderRoutes } from "./elder";

describe("elderContent", () => {
  it("mantém a faixa de prévia e o ensaio de ajuda sem prometer lugar", () => {
    expect(elderContent.banner).toContain("não avisa ninguém");
    expect(elderContent.sos.sentTitle).toContain("Sua família foi avisada");
    expect(elderContent.sos.sentSerious).toContain("192");
    expect(elderContent.sos.sentSerious).toContain("193");
    expect(elderContent.sos.confirmBody.toLowerCase()).not.toContain("localiza");
    expect(elderContent.home.finished).toContain("já saíram");
    expect(elderContent.home.empty).toContain("ainda não cadastrou");
    expect(elderContent.schedule.note).toContain("não precisa marcar");
    expect(elderContent.family.noPhone).toContain("Sem telefone");
    expect(elderContent.unlinked.familyLink).toBe("Sou da família");
  });

  it("não usa palavras de tomada", () => {
    const serialized = JSON.stringify(elderContent).toLowerCase();
    expect(serialized).not.toContain("tomou");
    expect(serialized).not.toContain("dose garantida");
    expect(serialized).not.toContain("confirmado");
  });

  it("aponta as quatro rotas da prévia", () => {
    expect(elderRoutes.home).toBe("/idoso");
    expect(elderRoutes.schedule).toBe("/idoso/horarios");
    expect(elderRoutes.family).toBe("/idoso/familia");
    expect(elderRoutes.settings).toBe("/idoso/ajustes");
    expect(elderRoutes.login).toBe("/entrar");
  });
});
