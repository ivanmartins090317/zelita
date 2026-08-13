import { onlyDigits } from "@/lib/format";

export type InviteContactType = "email" | "phone";

export interface ParsedInviteContact {
  type: InviteContactType;
  /** Valor normalizado para deduplicação (e-mail minúsculo ou dígitos BR). */
  normalized: string;
  /** Valor legível na UI. */
  display: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeBrazilPhone(digits: string): string | null {
  if (digits.length < 10 || digits.length > 11) return null;
  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);
  if (local.length < 8) return null;
  return `55${ddd}${local}`;
}

function formatBrazilPhoneDisplay(digits: string): string {
  if (digits.length <= 2) return `(${digits}`;
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${area}) ${rest}`;
  if (rest.length <= 8) {
    return `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function parseInviteContact(raw: string): ParsedInviteContact | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    const email = trimmed.toLowerCase();
    if (!EMAIL_PATTERN.test(email)) return null;
    return { type: "email", normalized: email, display: email };
  }

  const digits = onlyDigits(trimmed);
  const normalized = normalizeBrazilPhone(digits);
  if (!normalized) return null;

  return {
    type: "phone",
    normalized,
    display: formatBrazilPhoneDisplay(digits),
  };
}

export function isEmergencyPhoneOnlyInvite(input: {
  role: string;
  contact: ParsedInviteContact;
}): boolean {
  return (
    input.role === "emergency_contact" && input.contact.type === "phone"
  );
}

export function contactsMatch(
  left: ParsedInviteContact,
  right: ParsedInviteContact,
): boolean {
  return left.normalized === right.normalized;
}
