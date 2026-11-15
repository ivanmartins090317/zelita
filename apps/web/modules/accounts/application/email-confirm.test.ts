import { describe, expect, it } from "vitest";

import {
  buildAuthLinkForwardPath,
  isAuthRedirectPath,
  parseEmailConfirmParams,
} from "./email-confirm";

describe("parseEmailConfirmParams", () => {
  it("aceita o token do e-mail de acesso", () => {
    expect(
      parseEmailConfirmParams({
        tokenHash: "abc123hash",
        type: "email",
      }),
    ).toEqual({ tokenHash: "abc123hash", type: "email" });
  });

  it("aceita magiclink e signup", () => {
    expect(
      parseEmailConfirmParams({ tokenHash: "abc123hash", type: "magiclink" })
        ?.type,
    ).toBe("magiclink");
    expect(
      parseEmailConfirmParams({ tokenHash: "abc123hash", type: "signup" })
        ?.type,
    ).toBe("signup");
  });

  it("recusa tipo estranho, vazio e token inseguro", () => {
    expect(
      parseEmailConfirmParams({ tokenHash: "abc123hash", type: "recovery" }),
    ).toBeNull();
    expect(
      parseEmailConfirmParams({ tokenHash: "  ", type: "email" }),
    ).toBeNull();
    expect(
      parseEmailConfirmParams({ tokenHash: "abc<script>", type: "email" }),
    ).toBeNull();
    expect(
      parseEmailConfirmParams({
        tokenHash: "a".repeat(513),
        type: "email",
      }),
    ).toBeNull();
  });
});

describe("isAuthRedirectPath", () => {
  it("só libera os destinos do login", () => {
    expect(isAuthRedirectPath("/familia")).toBe(true);
    expect(isAuthRedirectPath("/cadastro")).toBe(true);
    expect(isAuthRedirectPath("/entrar")).toBe(true);
    expect(isAuthRedirectPath("//evil.example")).toBe(false);
    expect(isAuthRedirectPath("/familia/hoje")).toBe(false);
  });
});

describe("buildAuthLinkForwardPath", () => {
  it("prefere o token_hash quando os dois vêm na home", () => {
    expect(
      buildAuthLinkForwardPath({
        code: "abcdefgh1234",
        tokenHash: "abc123hash",
        type: "email",
      }),
    ).toBe("/auth/confirm?token_hash=abc123hash&type=email");
  });

  it("encaminha o code do link atual para o callback", () => {
    expect(
      buildAuthLinkForwardPath({
        code: "abc-def_1234",
        tokenHash: null,
        type: null,
      }),
    ).toBe("/auth/callback?code=abc-def_1234");
  });

  it("ignora query solta que não é retorno de acesso", () => {
    expect(
      buildAuthLinkForwardPath({
        code: "curto",
        tokenHash: null,
        type: null,
      }),
    ).toBeNull();
    expect(
      buildAuthLinkForwardPath({
        code: "https://evil.example",
        tokenHash: null,
        type: null,
      }),
    ).toBeNull();
  });
});
