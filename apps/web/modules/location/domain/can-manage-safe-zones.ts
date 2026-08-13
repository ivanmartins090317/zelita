import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";

export function canManageSafeZones(role: AccountRole): boolean {
  return role === ACCOUNT_ROLES.admin;
}
