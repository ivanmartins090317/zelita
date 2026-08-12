import { TRIAL_PLACEHOLDER_DAYS } from "@/modules/accounts/domain/roles";

/** Placeholder de billing — sem gateway nesta fatia. */
export const billingModule = {
  id: "billing",
  trialPlaceholderDays: TRIAL_PLACEHOLDER_DAYS,
  gatewayEnabled: false,
} as const;
