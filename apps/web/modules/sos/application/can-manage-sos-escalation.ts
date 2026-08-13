import type { AccountRole } from "@/modules/accounts/domain/roles";

import { canManageSosEscalation } from "../domain/sos-eligibility";

export function canManageSosEscalationForRole(role: AccountRole): boolean {
  return canManageSosEscalation(role);
}
