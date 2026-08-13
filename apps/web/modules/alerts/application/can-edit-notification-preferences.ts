import { canInviteOrChangeRoles } from "@/modules/accounts/domain/roles";

import type { AccountRole } from "@/modules/accounts/domain/roles";

export function canEditNotificationPreferences(role: AccountRole): boolean {
  return canInviteOrChangeRoles(role);
}

export function canViewNotificationMatrix(role: AccountRole): boolean {
  return role !== "emergency_contact";
}
