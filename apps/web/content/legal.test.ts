import { describe, expect, it } from "vitest";

import {
  legalContactEmail,
  legalContent,
  legalRoutes,
} from "./legal";

describe("legalContent", () => {
  it("expõe rotas públicas de Privacidade e Termos", () => {
    expect(legalRoutes.privacy).toBe("/privacidade");
    expect(legalRoutes.terms).toBe("/termos");
    expect(legalContent.privacy.title).toMatch(/privacidade/i);
    expect(legalContent.terms.title).toMatch(/termos/i);
  });

  it("mantém contato operacional e direitos LGPD", () => {
    expect(legalContent.contactEmail).toBe(legalContactEmail);
    expect(legalContent.privacy.intro).toMatch(/LGPD/);
    expect(
      legalContent.privacy.sections.some((section) =>
        section.title.toLowerCase().includes("direitos"),
      ),
    ).toBe(true);
  });

  it("deixa explícito que a Zelita não substitui emergência pública", () => {
    const termsText = legalContent.terms.sections
      .flatMap((section) => section.paragraphs)
      .join(" ");

    expect(termsText).toMatch(/SAMU 192/);
    expect(termsText).toMatch(/Bombeiros 193/);
  });
});
