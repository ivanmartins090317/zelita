import { describe, expect, it } from "vitest";

import { elderPrimaryTapClass, elderTapClass } from "./elder-classes";

describe("elderPrimaryTapClass", () => {
  it("fica verde com texto branco, sem herdar o fundo branco do alvo comum", () => {
    expect(elderTapClass).toContain("bg-white");
    expect(elderTapClass).toContain("text-ink");
    expect(elderPrimaryTapClass).toContain("bg-brand-700");
    expect(elderPrimaryTapClass).toContain("text-white");
    expect(elderPrimaryTapClass).not.toContain("bg-white");
    expect(elderPrimaryTapClass).not.toContain("text-ink");
  });
});
