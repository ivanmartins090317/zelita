export const SAMU_NUMBER = "192";
export const SAMU_TEL = "tel:192";
export const ELDER_KINSHIP_FALLBACK = "família";

export function elderKinshipLabel(
  relationship: string | null | undefined,
): string {
  const trimmed = relationship?.trim();
  return trimmed ? trimmed : ELDER_KINSHIP_FALLBACK;
}

export function toMemberTel(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits === SAMU_NUMBER || digits === "193") return `tel:${digits}`;
  if (digits.startsWith("55") && digits.length >= 12) return `tel:+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `tel:+55${digits}`;
  return null;
}

export interface ElderCallInput {
  id: string;
  displayName: string;
  relationshipLabel: string | null;
  phone: string | null;
}

export interface ElderCallRow {
  id: string;
  name: string;
  kinship: string;
  tel: string | null;
}

export function buildElderCallList(members: ElderCallInput[]): ElderCallRow[] {
  return members.map((member) => ({
    id: member.id,
    name: member.displayName.trim() || ELDER_KINSHIP_FALLBACK,
    kinship: elderKinshipLabel(member.relationshipLabel),
    tel: toMemberTel(member.phone),
  }));
}
