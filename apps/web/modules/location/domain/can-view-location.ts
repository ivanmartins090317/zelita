import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";

export function canViewLocation(role: AccountRole): boolean {
  return (
    role === ACCOUNT_ROLES.admin || role === ACCOUNT_ROLES.caregiver
  );
}
