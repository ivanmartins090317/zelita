import { signupContent } from "@/content/signup";
import { onlyDigits } from "@/lib/format";
import { validateDndWindow } from "@/modules/care-recipients/domain/message-preview";
import {
  SIGNUP_STEP,
  type SignupStepNumber,
} from "@/modules/care-recipients/application/signup-routing";
import {
  isSignupStepRequiringSession,
  type SignupWizardData,
} from "@/modules/care-recipients/presentation/signup-types";

export function validateSignupEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return signupContent.validation.emailInvalid;
  }
  return undefined;
}

export function validateSignupPhone(phone: string): string | undefined {
  if (onlyDigits(phone).length < 10) {
    return signupContent.validation.phoneInvalid;
  }
  return undefined;
}

export function validateManagerStep(data: SignupWizardData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.managerName.trim().length < 2) {
    errors.managerName = signupContent.validation.managerNameRequired;
  }
  const phoneError = validateSignupPhone(data.managerWhatsapp);
  if (phoneError) errors.managerWhatsapp = phoneError;
  return errors;
}

export function validateCareStep(data: SignupWizardData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.careFullName.trim().length < 2) {
    errors.careFullName = signupContent.validation.careFullNameRequired;
  }
  if (data.careDisplayName.trim().length < 2) {
    errors.careDisplayName = signupContent.validation.careDisplayNameRequired;
  }
  return errors;
}

export function validateContactStep(data: SignupWizardData): Record<string, string> {
  const errors: Record<string, string> = {};
  const phoneError = validateSignupPhone(data.careWhatsapp);
  if (phoneError) errors.careWhatsapp = phoneError;
  if (data.addressText.trim().length < 5) {
    errors.addressText = signupContent.validation.addressRequired;
  }
  return errors;
}

export function validateChannelStep(data: SignupWizardData): string | undefined {
  const result = validateDndWindow({
    dontBotherBefore: data.dontBotherBefore,
    dontBotherAfter: data.dontBotherAfter,
  });
  return result.ok ? undefined : result.message;
}

export function resolveActiveSignupStep(
  step: SignupStepNumber,
  sessionReady: boolean,
): SignupStepNumber {
  if (isSignupStepRequiringSession(step) && !sessionReady) {
    return SIGNUP_STEP.email;
  }
  return step;
}

export function nextSignupStep(from: SignupStepNumber): SignupStepNumber {
  return (from + 1) as SignupStepNumber;
}

export function buildSignupPayload(data: SignupWizardData) {
  return {
    managerName: data.managerName.trim(),
    managerWhatsapp: data.managerWhatsapp,
    careFullName: data.careFullName.trim(),
    careDisplayName: data.careDisplayName.trim(),
    careBirthDate: data.careBirthDate,
    careRelationship: data.careRelationship,
    careWhatsapp: data.careWhatsapp,
    addressText: data.addressText.trim(),
    channelPreference: data.channelPreference,
    tone: data.tone,
    dontBotherBefore: data.dontBotherBefore,
    dontBotherAfter: data.dontBotherAfter,
    planChoice: data.planChoice,
  };
}
