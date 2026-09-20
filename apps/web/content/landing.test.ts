import { describe, expect, it } from "vitest";

import {
  landingContent,
  landingContentBlockKeys,
  landingRoutes,
} from "./landing";

describe("landingContent", () => {
  it("exporta todos os blocos obrigatórios da Spec", () => {
    for (const key of landingContentBlockKeys) {
      expect(landingContent[key]).toBeDefined();
    }

    expect(Object.keys(landingContent).sort()).toEqual(
      [...landingContentBlockKeys].sort(),
    );
  });

  it("mantém CTAs, âncora e documentos legais travados", () => {
    expect(landingRoutes.signup).toBe("/cadastro");
    expect(landingRoutes.login).toBe("/entrar");
    expect(landingRoutes.howItWorksAnchor).toBe("#como-funciona");
    expect(landingContent.howItWorks.anchorId).toBe("como-funciona");
    expect(landingRoutes.privacy).toBe("/privacidade");
    expect(landingRoutes.terms).toBe("/termos");
    expect(landingContent.footer.legalLinks.map((link) => link.href)).toEqual([
      "/privacidade",
      "/termos",
    ]);
  });

  it("mantém os três planos com preços do protótipo", () => {
    expect(landingContent.plans.items).toHaveLength(3);
    expect(landingContent.plans.items.map((plan) => plan.monthlyPrice)).toEqual([
      39, 69, 119,
    ]);
  });

  it("preserva copy sensível fora do MVP registrada na Spec", () => {
    const familia = landingContent.plans.items.find(
      (plan) => plan.id === "familia",
    );

    expect(familia?.features.some((feature) => feature.text.includes("Resumo semanal"))).toBe(
      true,
    );
  });
});
