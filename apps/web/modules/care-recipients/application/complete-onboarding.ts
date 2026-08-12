"use server";

import {
  completeSignup,
  type SignupPayload,
  type SignupResult,
} from "@/modules/care-recipients/application/complete-signup";

export interface OnboardingResult {
  ok: boolean;
  message?: string;
}

/** @deprecated Use completeSignup com payload do wizard F3. */
export async function completeOnboarding(
  _prev: OnboardingResult,
  formData: FormData,
): Promise<OnboardingResult> {
  const payload: SignupPayload = {
    managerName: String(formData.get("managerName") ?? ""),
    managerWhatsapp: String(formData.get("managerWhatsapp") ?? ""),
    careFullName: String(formData.get("careFullName") ?? ""),
    careDisplayName: String(formData.get("careDisplayName") ?? ""),
    careBirthDate: String(formData.get("careBirthDate") ?? ""),
    careRelationship: "pai",
    careWhatsapp: String(formData.get("careWhatsapp") ?? ""),
    addressText: String(formData.get("addressText") ?? ""),
    channelPreference: "whatsapp",
    tone: "carinhoso",
    dontBotherBefore: String(formData.get("dndEnd") ?? "07:00"),
    dontBotherAfter: String(formData.get("dndStart") ?? "22:00"),
    planChoice: "trial",
  };

  const result: SignupResult = await completeSignup(payload);
  return result;
}

export { completeSignup };
