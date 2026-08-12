import { EMPTY_VALUE } from "./empty-value";

const LOCALE = "pt-BR";
const CURRENCY = "BRL";

/** Formata em real brasileiro: `R$ 39,90`. Entrada inválida vira valor neutro. */
export function formatCurrencyBRL(value: number | null | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return EMPTY_VALUE;

  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(value);
}
