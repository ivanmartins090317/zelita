import {
  ACCOUNT_ROLES,
  canInviteOrChangeRoles,
  type AccountRole,
} from "@/modules/accounts/domain/roles";

export function canEditCareSettings(role: AccountRole): boolean {
  return canInviteOrChangeRoles(role);
}

export function canViewAjustes(role: AccountRole): boolean {
  return (
    role === ACCOUNT_ROLES.admin || role === ACCOUNT_ROLES.caregiver
  );
}
