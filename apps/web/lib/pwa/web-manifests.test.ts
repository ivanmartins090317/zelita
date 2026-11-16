import { describe, expect, it } from "vitest";

import {
  isWebManifestSurface,
  WEB_MANIFESTS,
  webManifestPath,
} from "@/lib/pwa/web-manifests";

describe("manifestos instaláveis", () => {
  it("separa o painel da família do app da pessoa cuidada", () => {
    const family = WEB_MANIFESTS.familia();
    const elder = WEB_MANIFESTS.idoso();

    expect(family.id).toBe("/familia");
    expect(family.start_url).toBe("/familia");
    expect(family.scope).toBe("/familia");
    expect(family.short_name).toBe("Família");

    expect(elder.id).toBe("/idoso");
    expect(elder.start_url).toBe("/idoso");
    expect(elder.scope).toBe("/idoso");
    expect(elder.short_name).toBe("Zelita");

    expect(family.id).not.toBe(elder.id);
    expect(webManifestPath("familia")).toBe("/pwa/familia");
    expect(webManifestPath("idoso")).toBe("/pwa/idoso");
  });

  it("só aceita as duas superfícies", () => {
    expect(isWebManifestSurface("familia")).toBe(true);
    expect(isWebManifestSurface("idoso")).toBe(true);
    expect(isWebManifestSurface("entrar")).toBe(false);
  });
});
