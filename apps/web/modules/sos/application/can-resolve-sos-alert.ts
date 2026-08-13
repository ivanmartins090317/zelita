import type { AccountRole } from "@/modules/accounts/domain/roles";

import { canResolveSosAlert } from "../domain/sos-eligibility";

export function canResolveSosAlertForRole(role: AccountRole): boolean {
  return canResolveSosAlert(role);
}
