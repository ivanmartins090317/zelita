import { canManageBilling, type AccountRole } from "@/modules/accounts/domain/roles";

export function canViewBilling(role: AccountRole): boolean {
  return canManageBilling(role);
}
