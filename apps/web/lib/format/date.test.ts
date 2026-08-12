import { describe, expect, it } from "vitest";

import { formatDateBR } from "./date";
import { EMPTY_VALUE } from "./empty-value";

describe("formatDateBR", () => {
  it("formata no padrão brasileiro de data", () => {
    expect(formatDateBR(new Date("2026-08-12T00:00:00.000Z"))).toBe(
      "12/08/2026",
    );
  });

  it("aceita string ISO e timestamp", () => {
    expect(formatDateBR("2026-09-10")).toBe("10/09/2026");
    expect(formatDateBR(Date.UTC(2026, 0, 1))).toBe("01/01/2026");
  });

  it("usa UTC por padrão e respeita fuso informado", () => {
    const lateNight = new Date("2026-08-12T02:00:00.000Z");
    expect(formatDateBR(lateNight)).toBe("12/08/2026");
    expect(formatDateBR(lateNight, "America/Sao_Paulo")).toBe("11/08/2026");
  });

  it("devolve valor neutro para entrada inválida", () => {
    expect(formatDateBR("não é data")).toBe(EMPTY_VALUE);
    expect(formatDateBR(new Date("inválida"))).toBe(EMPTY_VALUE);
    expect(formatDateBR("")).toBe(EMPTY_VALUE);
    expect(formatDateBR(null)).toBe(EMPTY_VALUE);
    expect(formatDateBR(undefined)).toBe(EMPTY_VALUE);
  });
});
