import { describe, expect, it } from "vitest";

import { familyRoutes } from "@/content/family";
import {
  buildFamilyNavSections,
  isNavItemActive,
  listFamilyNavItems,
  resolveNavAreaFromPath,
} from "./family-nav";

describe("buildFamilyNavSections", () => {
  it("expõe onze itens com seções do protótipo", () => {
    const sections = buildFamilyNavSections();
    const labels = sections
      .map((section) => section.label)
      .filter(Boolean);
    expect(labels).toEqual(["Segurança", "Saúde", "Ajuda", "Conta"]);
    expect(listFamilyNavItems()).toHaveLength(11);
  });
});

describe("resolveNavAreaFromPath", () => {
  it("mapeia rotas canônicas", () => {
    expect(resolveNavAreaFromPath("/familia")).toBe("hoje");
    expect(resolveNavAreaFromPath("/familia/remedios")).toBe("remedios");
    expect(resolveNavAreaFromPath("/familia/consultas")).toBe("consultas");
    expect(resolveNavAreaFromPath("/familia/pedidos-de-ajuda")).toBe(
      "pedidos-de-ajuda",
    );
    expect(resolveNavAreaFromPath("/familia/ajustes")).toBe("ajustes");
  });

  it("cai em hoje para caminho desconhecido", () => {
    expect(resolveNavAreaFromPath("/familia/desconhecido")).toBe("hoje");
  });
});

describe("isNavItemActive", () => {
  it("marca hoje só na raiz", () => {
    expect(isNavItemActive("/familia", familyRoutes.hoje)).toBe(true);
    expect(isNavItemActive("/familia/remedios", familyRoutes.hoje)).toBe(false);
  });

  it("marca subrotas de remédios", () => {
    expect(isNavItemActive("/familia/remedios", familyRoutes.remedios)).toBe(
      true,
    );
  });
});

describe("familyNavPaths", () => {
  it("inclui todos os destinos da spec", () => {
    const paths = listFamilyNavItems().map((item) => item.path);
    expect(paths).toContain("/familia/localizacao");
    expect(paths).toContain("/familia/exames");
    expect(paths).toContain("/familia/guia");
  });
});
