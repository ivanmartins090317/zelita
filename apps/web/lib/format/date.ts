import { EMPTY_VALUE } from "./empty-value";

const LOCALE = "pt-BR";

/**
 * As datas do domínio (fim de cartela, agendamento de lembrete) são ancoradas
 * em UTC. Formatar em UTC por padrão evita que servidor e navegador mostrem
 * dias diferentes para o mesmo registro.
 */
const DEFAULT_TIME_ZONE = "UTC";

export type DateInput = Date | string | number | null | undefined;

/** Formata no padrão brasileiro: `12/08/2026`. Entrada inválida vira neutro. */
export function formatDateBR(
  value: DateInput,
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const date = toDate(value);
  if (!date) return EMPTY_VALUE;

  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  }).format(date);
}

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
