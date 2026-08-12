import { completeOnboarding, completeSignup } from "./application/complete-onboarding";

export const careRecipientsModule = {
  id: "care-recipients",
} as const;

export { completeOnboarding, completeSignup };
