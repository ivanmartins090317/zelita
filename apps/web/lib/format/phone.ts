/** Celular brasileiro: 2 dígitos de DDD + 9 do número. Fixo tem 8. */
const MAX_PHONE_DIGITS = 11;
const MOBILE_LOCAL_DIGITS = 9;
const MOBILE_PREFIX_DIGITS = 5;
const LANDLINE_PREFIX_DIGITS = 4;

export function onlyDigits(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Formata para o padrão legível do país: `(11) 97777-4321`.
 * Aceita número com ou sem pontuação e formata parcialmente durante a
 * digitação — nunca lança erro e nunca completa dígito que não foi informado.
 */
export function formatPhoneBR(value: string | null | undefined): string {
  const digits = onlyDigits(value).slice(0, MAX_PHONE_DIGITS);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const local = digits.slice(2);
  const prefixLength =
    local.length < MOBILE_LOCAL_DIGITS
      ? LANDLINE_PREFIX_DIGITS
      : MOBILE_PREFIX_DIGITS;

  if (local.length <= prefixLength) return `(${areaCode}) ${local}`;
  return `(${areaCode}) ${local.slice(0, prefixLength)}-${local.slice(prefixLength)}`;
}
