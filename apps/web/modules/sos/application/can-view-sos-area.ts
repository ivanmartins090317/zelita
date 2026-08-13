import type { AccountRole } from "@/modules/accounts/domain/roles";

import { canViewSosArea } from "../domain/sos-eligibility";

export function canViewSosAreaForRole(
  role: AccountRole,
  isInEscalationOrder: boolean,
): boolean {
  return canViewSosArea({ role, isInEscalationOrder });
}
