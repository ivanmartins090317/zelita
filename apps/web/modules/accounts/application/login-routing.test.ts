import { describe, expect, it } from "vitest";

import {
  buildAvatarInitials,
  computeAgeFromBirthDate,
  computeResendSecondsRemaining,
  destinationPathForRoute,
  formatCareRecipientSubtitle,
  formatResendCountdown,
  mapMembershipsToLoginOptions,
  isAccountOnboardingComplete,
  resolvePostLoginRoute,
  resolveValidSelectedAccountId,
} from "./login-routing";

const accountA = { accountId: "a", careRecipientId: "cr-a" };
const accountB = { accountId: "b", careRecipientId: "cr-b" };
const accountIncomplete = { accountId: "c", careRecipientId: null };

describe("isAccountOnboardingComplete", () => {
  it("exige pessoa cuidada", () => {
    expect(isAccountOnboardingComplete(accountA)).toBe(true);
    expect(isAccountOnboardingComplete(accountIncomplete)).toBe(false);
  });
});

describe("resolveValidSelectedAccountId", () => {
  it("aceita id presente na lista", () => {
    expect(resolveValidSelectedAccountId("a", ["a", "b"])).toBe("a");
  });

  it("rejeita id ausente ou vazio", () => {
    expect(resolveValidSelectedAccountId("x", ["a", "b"])).toBeNull();
    expect(resolveValidSelectedAccountId(null, ["a"])).toBeNull();
  });
});

describe("resolvePostLoginRoute", () => {
  it("manda usuário novo ao começar", () => {
    expect(resolvePostLoginRoute([], null)).toEqual({
      kind: "onboarding",
      accountId: null,
    });
  });

  it("conta única completa vai ao painel", () => {
    expect(resolvePostLoginRoute([accountA], null)).toEqual({
      kind: "familia",
      accountId: "a",
    });
  });

  it("conta única incompleta vai ao começar", () => {
    expect(resolvePostLoginRoute([accountIncomplete], null)).toEqual({
      kind: "onboarding",
      accountId: "c",
    });
  });

  it("várias contas sem preferência abrem seletor", () => {
    expect(resolvePostLoginRoute([accountA, accountB], null)).toEqual({
      kind: "picker",
      accountId: null,
    });
  });

  it("várias contas com preferência válida pulam seletor", () => {
    expect(resolvePostLoginRoute([accountA, accountB], "b")).toEqual({
      kind: "familia",
      accountId: "b",
    });
  });

  it("preferência inválida reabre seletor", () => {
    expect(resolvePostLoginRoute([accountA, accountB], "z")).toEqual({
      kind: "picker",
      accountId: null,
    });
  });
});

describe("formatResendCountdown", () => {
  it("formata minutos e segundos", () => {
    expect(formatResendCountdown(45)).toBe("0:45");
    expect(formatResendCountdown(7)).toBe("0:07");
    expect(formatResendCountdown(0)).toBe("0:00");
  });
});

describe("computeResendSecondsRemaining", () => {
  it("diminui conforme o tempo passa", () => {
    expect(computeResendSecondsRemaining(1000, 45, 5000)).toBe(41);
    expect(computeResendSecondsRemaining(0, 45, 50_000)).toBe(0);
  });
});

describe("buildAvatarInitials", () => {
  it("pega iniciais de um ou dois nomes", () => {
    expect(buildAvatarInitials("Seu João")).toBe("SJ");
    expect(buildAvatarInitials("Maria")).toBe("MA");
    expect(buildAvatarInitials("")).toBe("?");
  });
});

describe("computeAgeFromBirthDate", () => {
  it("calcula idade a partir da data", () => {
    expect(computeAgeFromBirthDate("1948-03-15", new Date("2026-08-12"))).toBe(
      78,
    );
    expect(computeAgeFromBirthDate(null)).toBeNull();
  });
});

describe("formatCareRecipientSubtitle", () => {
  it("monta linha com relação, idade e papel", () => {
    expect(
      formatCareRecipientSubtitle({
        relationship: "Seu pai",
        age: 78,
        roleLabel: "você é administradora",
      }),
    ).toBe("Seu pai · 78 anos · você é administradora");
  });
});

describe("mapMembershipsToLoginOptions", () => {
  it("monta linha descritiva por conta", () => {
    const options = mapMembershipsToLoginOptions(
      [
        {
          accountId: "a",
          role: "admin",
          careRecipientDisplayName: "Seu João",
          careRecipientRelationship: "Seu pai",
          careRecipientBirthDate: "1948-03-15",
        },
      ],
      {
        admin: "você é administradora",
        caregiver: "cuidadora",
        viewer: "visualização",
        emergency_contact: "emergência",
      },
    );

    expect(options[0]?.displayName).toBe("Seu João");
    expect(options[0]?.initials).toBe("SJ");
    expect(options[0]?.subtitle).toContain("Seu pai");
    expect(options[0]?.subtitle).toContain("administradora");
  });
});

describe("destinationPathForRoute", () => {
  it("mapeia destinos conhecidos", () => {
    expect(
      destinationPathForRoute({ kind: "familia", accountId: "a" }),
    ).toBe("/familia");
    expect(
      destinationPathForRoute({ kind: "onboarding", accountId: "a" }),
    ).toBe("/cadastro");
    expect(destinationPathForRoute({ kind: "picker", accountId: null })).toBe(
      "/entrar",
    );
  });
});
