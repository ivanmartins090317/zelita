export {
  shouldPauseUnpaidTrial,
  shouldSendTrialEndingWarning,
  TRIAL_WARNING_DAYS,
} from "./domain/trial-jobs";
export {
  hasAdvancedLocation,
  hasVoiceFeature,
  resolveEffectivePlan,
  resolveStorageQuotaBytes,
} from "./domain/effective-plan";
export { formatBytesReadable } from "./domain/usage-formatters";
export { getPlanoPage } from "./application/get-plano-page";
export type { PlanoPageViewModel } from "./application/get-plano-page";

import { TRIAL_PLACEHOLDER_DAYS } from "@/modules/accounts/domain/roles";

/** API pública estreita do módulo billing. */
export const billingModule = {
  id: "billing",
  trialPlaceholderDays: TRIAL_PLACEHOLDER_DAYS,
  gatewayEnabled: false,
} as const;
