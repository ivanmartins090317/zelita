"use server";

import { z } from "zod";

import { familyContent } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { onlyDigits } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canEditCareSettings } from "./can-edit-care-settings";
import { revalidateAjustesPaths } from "./revalidate-ajustes-paths";
import {
  logCareRecipientUpdated,
  updateCareRecipientProfile,
} from "../infrastructure/care-recipient-profile-repo";

export interface UpdateCareRecipientProfileResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const phoneSchema = z
  .string()
  .transform((value) => onlyDigits(value))
  .refine((digits) => digits.length >= 10, "Informe um WhatsApp válido.");

const profileSchema = z.object({
  fullName: z.string().min(2, "Informe o nome completo."),
  displayName: z.string().min(2, "Informe como chamamos."),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD.")
    .optional()
    .or(z.literal("")),
  whatsapp: phoneSchema,
  addressText: z.string().min(5, "Informe o endereço completo."),
});

export async function updateCareRecipientProfileAction(
  _prev: UpdateCareRecipientProfileResult,
  formData: FormData,
): Promise<UpdateCareRecipientProfileResult> {
  const copy = familyContent.ajustes.errors;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, message: copy.forbidden };
    }
    if (!canEditCareSettings(ctx.role)) {
      return { ok: false, message: copy.forbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.accountPaused };
    }

    const parsed = profileSchema.safeParse({
      fullName: String(formData.get("fullName") ?? "").trim(),
      displayName: String(formData.get("displayName") ?? "").trim(),
      birthDate: String(formData.get("birthDate") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      addressText: String(formData.get("addressText") ?? "").trim(),
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return {
        ok: false,
        message: familyContent.ajustes.recipient.modal.validationSummary,
        fieldErrors,
      };
    }

    const supabase = await createSupabaseServerClient();
    await updateCareRecipientProfile(supabase, {
      careRecipientId: ctx.careRecipientId,
      fullName: parsed.data.fullName,
      displayName: parsed.data.displayName,
      birthDate: parsed.data.birthDate || null,
      whatsapp: parsed.data.whatsapp,
      addressText: parsed.data.addressText,
    });

    logCareRecipientUpdated({
      accountId: ctx.accountId,
      careRecipientId: ctx.careRecipientId,
      event: "care_recipient_updated",
    });

    await revalidateAjustesPaths();

    return { ok: true, message: familyContent.ajustes.recipient.saveSuccess };
  } catch {
    return { ok: false, message: copy.saveFailed };
  }
}
