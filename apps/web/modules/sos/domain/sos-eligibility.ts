import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";

/** Papéis elegíveis à ordem de aviso por padrão (visualizador fora). */
export function isDefaultEligibleForEscalation(role: AccountRole): boolean {
  return (
    role === ACCOUNT_ROLES.admin ||
    role === ACCOUNT_ROLES.caregiver ||
    role === ACCOUNT_ROLES.emergency_contact
  );
}

/** Visualizador só entra se incluído explicitamente na ordem. */
export function isEligibleForEscalation(
  role: AccountRole,
  explicitlyIncluded: boolean,
): boolean {
  if (isDefaultEligibleForEscalation(role)) return true;
  if (role === ACCOUNT_ROLES.viewer && explicitlyIncluded) return true;
  return false;
}

export interface CanViewSosAreaInput {
  role: AccountRole;
  isInEscalationOrder: boolean;
}

export function canViewSosArea(input: CanViewSosAreaInput): boolean {
  if (
    input.role === ACCOUNT_ROLES.admin ||
    input.role === ACCOUNT_ROLES.caregiver ||
    input.role === ACCOUNT_ROLES.emergency_contact
  ) {
    return true;
  }
  if (input.role === ACCOUNT_ROLES.viewer) {
    return input.isInEscalationOrder;
  }
  return false;
}

export function canManageSosEscalation(role: AccountRole): boolean {
  return role === ACCOUNT_ROLES.admin;
}

export function canResolveSosAlert(role: AccountRole): boolean {
  return (
    role === ACCOUNT_ROLES.admin || role === ACCOUNT_ROLES.caregiver
  );
}

/** Contagem para checklist tarefa 2 — ≥2 contatos elegíveis salvos. */
export function isSosEscalationChecklistComplete(contactCount: number): boolean {
  return contactCount >= 2;
}
