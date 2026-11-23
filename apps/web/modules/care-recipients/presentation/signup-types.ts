import {
  SIGNUP_CHANNELS,
  SIGNUP_DEFAULT_DND,
  SIGNUP_PLAN_CHOICES,
  SIGNUP_RELATIONSHIP_SLUGS,
  SIGNUP_TONES,
  type SignupChannelSlug,
  type SignupInviteRoleSlug,
  type SignupPlanChoice,
  type SignupToneSlug,
} from "@/modules/care-recipients/domain/signup-options";
import { SIGNUP_STEP, type SignupStepNumber } from "@/modules/care-recipients/application/signup-routing";
import {
  initialSignupAddress,
  type SignupAddressParts,
} from "@/modules/care-recipients/presentation/signup-address";

export interface SignupLocalInvite {
  id: string;
  contact: string;
  role: SignupInviteRoleSlug;
}

export interface SignupWizardData {
  email: string;
  code: string;
  managerName: string;
  managerWhatsapp: string;
  careFullName: string;
  careDisplayName: string;
  careBirthDate: string;
  careRelationship: keyof typeof import("@/modules/care-recipients/domain/signup-options").SIGNUP_RELATIONSHIPS;
  careWhatsapp: string;
  address: SignupAddressParts;
  channelPreference: SignupChannelSlug;
  tone: SignupToneSlug;
  dontBotherBefore: string;
  dontBotherAfter: string;
  localInvites: SignupLocalInvite[];
  planChoice: SignupPlanChoice;
}

export const initialSignupWizardData: SignupWizardData = {
  email: "",
  code: "",
  managerName: "",
  managerWhatsapp: "",
  careFullName: "",
  careDisplayName: "",
  careBirthDate: "",
  careRelationship: SIGNUP_RELATIONSHIP_SLUGS[0],
  careWhatsapp: "",
  address: initialSignupAddress,
  channelPreference: SIGNUP_CHANNELS.whatsapp,
  tone: SIGNUP_TONES.carinhoso,
  dontBotherBefore: SIGNUP_DEFAULT_DND.dontBotherBefore,
  dontBotherAfter: SIGNUP_DEFAULT_DND.dontBotherAfter,
  localInvites: [],
  planChoice: SIGNUP_PLAN_CHOICES.trial,
};

export function isSignupStepRequiringSession(step: SignupStepNumber): boolean {
  return step >= SIGNUP_STEP.manager;
}

export function clampSignupStep(step: number): SignupStepNumber {
  if (step <= SIGNUP_STEP.email) return SIGNUP_STEP.email;
  if (step >= SIGNUP_STEP.plan) return SIGNUP_STEP.plan;
  return step as SignupStepNumber;
}

export function resolveGuardedSignupStep(
  requestedStep: SignupStepNumber,
  isAuthenticated: boolean,
  pendingEmail: string | null,
): SignupStepNumber {
  if (isAuthenticated) {
    return requestedStep >= SIGNUP_STEP.manager
      ? requestedStep
      : SIGNUP_STEP.manager;
  }
  if (pendingEmail) {
    return requestedStep === SIGNUP_STEP.code
      ? SIGNUP_STEP.code
      : SIGNUP_STEP.email;
  }
  return SIGNUP_STEP.email;
}

export type SignupCodeUiStep = "code" | "error";
