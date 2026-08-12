import { describe, expect, it } from "vitest";

import { formatCurrencyBRL } from "./currency";
import { EMPTY_VALUE } from "./empty-value";

/** `Intl` separa o símbolo com espaço não separável. */
function normalize(value: string): string {
  return value.replace(/\u00a0/g, " ");
}

describe("formatCurrencyBRL", () => {
  it("formata no padrão brasileiro de moeda", () => {
    expect(normalize(formatCurrencyBRL(39.9))).toBe("R$ 39,90");
    expect(normalize(formatCurrencyBRL(0))).toBe("R$ 0,00");
    expect(normalize(formatCurrencyBRL(1234.5))).toBe("R$ 1.234,50");
  });

  it("mantém o sinal de valor negativo", () => {
    expect(normalize(formatCurrencyBRL(-19.9))).toBe("-R$ 19,90");
  });

  it("devolve valor neutro para entrada inválida", () => {
    expect(formatCurrencyBRL(Number.NaN)).toBe(EMPTY_VALUE);
    expect(formatCurrencyBRL(Number.POSITIVE_INFINITY)).toBe(EMPTY_VALUE);
    expect(formatCurrencyBRL(null)).toBe(EMPTY_VALUE);
    expect(formatCurrencyBRL(undefined)).toBe(EMPTY_VALUE);
  });
});
