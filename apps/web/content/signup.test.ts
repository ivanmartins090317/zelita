import { describe, expect, it } from "vitest";

import { signupContent, signupRoutes } from "./signup";

describe("signupContent", () => {
  it("expõe copy dos 8 passos", () => {
    expect(signupRoutes.stepNames).toHaveLength(8);
    expect(signupContent.email.title).toBeTruthy();
    expect(signupContent.code.title).toBeTruthy();
    expect(signupContent.manager.title).toBeTruthy();
    expect(signupContent.careRecipient.title).toBeTruthy();
    expect(signupContent.contact.title).toBeTruthy();
    expect(signupContent.channel.title).toBeTruthy();
    expect(signupContent.invites.title).toBeTruthy();
    expect(signupContent.plan.title).toBeTruthy();
    expect(signupContent.resendCooldownSeconds).toBe(45);
  });

  it("deixa claro que pessoa cuidada não cria conta", () => {
    expect(signupContent.careRecipient.subtitle.toLowerCase()).toContain(
      "não",
    );
    expect(signupContent.careRecipient.subtitle).toContain("conta");
  });

  it("usa CTA honesto no assinar agora", () => {
    expect(signupContent.plan.subscribeCtaDisabled).toContain("Pagamento");
    expect(signupContent.plan.subscribeCta).toBe("Ir para pagamento seguro");
  });
});

describe("signupRoutes", () => {
  it("aponta rota canônica de cadastro", () => {
    expect(signupRoutes.cadastro).toBe("/cadastro");
    expect(signupRoutes.onboarding).toBe("/onboarding");
  });
});
