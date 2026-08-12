import { describe, expect, it } from "vitest";

import {
  destinationPathForIncompleteSignup,
  hasAnyCompleteMembership,
  resolveSignupInitialStep,
  resolveSignupOtpOutcome,
  SIGNUP_STEP,
  signupStepLabel,
} from "./signup-routing";

describe("resolveSignupOtpOutcome", () => {
  it("continua o wizard quando não há pessoa cuidada", () => {
    expect(
      resolveSignupOtpOutcome([
        { accountId: "a", careRecipientId: null },
      ]),
    ).toEqual({ kind: "continue", accountId: "a" });
  });

  it("sinaliza conta pronta quando já existe pessoa cuidada", () => {
    expect(
      resolveSignupOtpOutcome([
        { accountId: "a", careRecipientId: "cr-1" },
      ]),
    ).toEqual({ kind: "already_complete", accountId: "a" });
  });

  it("pede seletor quando há várias contas completas", () => {
    expect(
      resolveSignupOtpOutcome([
        { accountId: "a", careRecipientId: "cr-1" },
        { accountId: "b", careRecipientId: "cr-2" },
      ]),
    ).toEqual({ kind: "picker" });
  });
});

describe("resolveSignupInitialStep", () => {
  it("começa no e-mail sem sessão", () => {
    expect(
      resolveSignupInitialStep({
        isAuthenticated: false,
        hasCompleteAccount: false,
      }),
    ).toBe(SIGNUP_STEP.email);
  });

  it("vai ao código se e-mail pendente", () => {
    expect(
      resolveSignupInitialStep({
        isAuthenticated: false,
        hasCompleteAccount: false,
        pendingEmail: "a@b.com",
      }),
    ).toBe(SIGNUP_STEP.code);
  });

  it("vai ao gestor com sessão e cadastro incompleto", () => {
    expect(
      resolveSignupInitialStep({
        isAuthenticated: true,
        hasCompleteAccount: false,
      }),
    ).toBe(SIGNUP_STEP.manager);
  });
});

describe("destinationPathForIncompleteSignup", () => {
  it("aponta para /cadastro", () => {
    expect(destinationPathForIncompleteSignup()).toBe("/cadastro");
  });
});

describe("hasAnyCompleteMembership", () => {
  it("detecta conta com pessoa cuidada", () => {
    expect(
      hasAnyCompleteMembership([
        { accountId: "a", careRecipientId: null },
        { accountId: "b", careRecipientId: "cr" },
      ]),
    ).toBe(true);
  });
});

describe("signupStepLabel", () => {
  it("expõe rótulo do passo 1", () => {
    expect(signupStepLabel(1)).toBeTruthy();
  });
});
