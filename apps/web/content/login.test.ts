import { describe, expect, it } from "vitest";

import { loginContent, loginRoutes } from "./login";

describe("loginContent", () => {
  it("expõe os blocos obrigatórios da entrada", () => {
    expect(loginContent.email.title).toBeTruthy();
    expect(loginContent.code.title).toBeTruthy();
    expect(loginContent.error.title).toBeTruthy();
    expect(loginContent.picker.title).toBeTruthy();
    expect(loginContent.help.items).toHaveLength(6);
    expect(loginContent.resendCooldownSeconds).toBe(45);
  });

  it("não menciona link mágico na copy", () => {
    const serialized = JSON.stringify(loginContent).toLowerCase();
    expect(serialized).not.toContain("link mágico");
    expect(serialized).not.toContain("magic");
  });

  it("não promete bloqueio punitivo no erro", () => {
    const errorCopy = JSON.stringify(loginContent.error).toLowerCase();
    expect(errorCopy).not.toContain("15 min");
    expect(errorCopy).not.toContain("tentativa");
    expect(errorCopy).not.toContain("bloque");
  });
});

describe("loginRoutes", () => {
  it("aponta cadastro e destinos pós-login", () => {
    expect(loginRoutes.signup).toBe("/cadastro");
    expect(loginRoutes.familia).toBe("/familia");
    expect(loginRoutes.onboarding).toBe("/onboarding");
  });
});
