import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";

export function canManageExams(role: AccountRole | null | undefined): boolean {
  return role === ACCOUNT_ROLES.admin;
}
