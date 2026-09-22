const MIN_NATIONAL_DIGITS = 10;
const MAX_NATIONAL_DIGITS = 11;
const COUNTRY_CODE_BR = "55";

export function onlyDigits(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/** DDD + número (10 ou 11). Remove +55 quando vier da Cloud API. */
export function nationalPhoneDigits(raw: string | null | undefined): string {
  let digits = onlyDigits(raw);
  if (digits.startsWith(COUNTRY_CODE_BR) && digits.length >= 12) {
    digits = digits.slice(2);
  }
  if (digits.length > MAX_NATIONAL_DIGITS) {
    digits = digits.slice(-MAX_NATIONAL_DIGITS);
  }
  return digits;
}

export function phonesMatch(
  stored: string | null | undefined,
  incoming: string | null | undefined,
): boolean {
  const left = nationalPhoneDigits(stored);
  const right = nationalPhoneDigits(incoming);
  if (left.length < MIN_NATIONAL_DIGITS || right.length < MIN_NATIONAL_DIGITS) {
    return false;
  }
  if (left === right) return true;
  return left.slice(-10) === right.slice(-10);
}

export function normalizeOptInReply(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
}

export function isOptInAffirmation(text: string | null | undefined): boolean {
  if (!text) return false;
  return normalizeOptInReply(text) === "sim";
}
