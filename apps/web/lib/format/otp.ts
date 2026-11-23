import { onlyDigits } from "./phone";

/** Código de acesso do login e do vínculo de device (mínimo / padrão na UI). */
export const ACCESS_CODE_LENGTH = 6;
/** Supabase Auth pode emitir até 8 dígitos conforme config do projeto. */
export const ACCESS_CODE_MAX_LENGTH = 8;
/*
 * A UI mostra 6 casas numa linha só (o projeto emite código de 6 números);
 * o servidor segue aceitando até ACCESS_CODE_MAX_LENGTH por segurança.
 */
const ACCESS_CODE_GROUP_SIZE = 3;

export function resolveAccessCodeBoxLength(): number {
  return ACCESS_CODE_LENGTH;
}

export function normalizeAccessCodeInput(raw: string): string {
  return onlyDigits(raw).slice(0, ACCESS_CODE_MAX_LENGTH);
}

export function isValidAccessCodeLength(length: number): boolean {
  return length >= ACCESS_CODE_LENGTH && length <= ACCESS_CODE_MAX_LENGTH;
}

/**
 * Agrupa o código para conferência em voz alta: `835104` vira `835 104`.
 * Código mais curto ou mais longo que o esperado é agrupado do mesmo jeito,
 * sem quebrar a exibição.
 */
export function formatAccessCode(value: string | null | undefined): string {
  const digits = onlyDigits(value);
  if (digits.length === 0) return "";

  const groups: string[] = [];
  for (let start = 0; start < digits.length; start += ACCESS_CODE_GROUP_SIZE) {
    groups.push(digits.slice(start, start + ACCESS_CODE_GROUP_SIZE));
  }
  return groups.join(" ");
}

/**
 * Distribui o código nas casas da caixa de conferência. Casas ainda não
 * digitadas voltam vazias; dígitos além do tamanho são descartados.
 */
export function toAccessCodeDigits(
  value: string | null | undefined,
  length: number = ACCESS_CODE_LENGTH,
): string[] {
  const size = Math.max(length, 0);
  const digits = onlyDigits(value).slice(0, size);
  return Array.from({ length: size }, (_, index) => digits[index] ?? "");
}
