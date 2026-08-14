"use server";

import { z } from "zod";

import { familyContent } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canEditCareSettings } from "./can-edit-care-settings";
import { revalidateAjustesPaths } from "./revalidate-ajustes-paths";
import {
  mapDndToPersistence,
  validateDndWindow,
} from "../domain/message-preview";
import {
  SIGNUP_CHANNEL_SLUGS,
  SIGNUP_TONE_SLUGS,
  type SignupChannelSlug,
  type SignupToneSlug,
} from "../domain/signup-options";
import {
  logCareSettingsUpdated,
  updateCareRecipientSettings,
} from "../infrastructure/care-recipient-settings-repo";

export interface UpdateCareSettingsResult {
  ok: boolean;
  message?: string;
}

const settingsSchema = z.object({
  tone: z.enum(SIGNUP_TONE_SLUGS as [SignupToneSlug, ...SignupToneSlug[]]),
  channelPreference: z.enum(
    SIGNUP_CHANNEL_SLUGS as [SignupChannelSlug, ...SignupChannelSlug[]],
  ),
  dontBotherBefore: z.string(),
  dontBotherAfter: z.string(),
});

export async function updateCareSettingsAction(
  _prev: UpdateCareSettingsResult,
  formData: FormData,
): Promise<UpdateCareSettingsResult> {
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

    const parsed = settingsSchema.safeParse({
      tone: formData.get("tone"),
      channelPreference: formData.get("channelPreference"),
      dontBotherBefore: formData.get("dontBotherBefore"),
      dontBotherAfter: formData.get("dontBotherAfter"),
    });

    if (!parsed.success) {
      return { ok: false, message: copy.invalidPayload };
    }

    const dndValidation = validateDndWindow({
      dontBotherBefore: parsed.data.dontBotherBefore,
      dontBotherAfter: parsed.data.dontBotherAfter,
    });
    if (!dndValidation.ok) {
      return { ok: false, message: dndValidation.message };
    }

    const dnd = mapDndToPersistence({
      dontBotherBefore: parsed.data.dontBotherBefore,
      dontBotherAfter: parsed.data.dontBotherAfter,
    });

    const supabase = await createSupabaseServerClient();
    await updateCareRecipientSettings(supabase, {
      careRecipientId: ctx.careRecipientId,
      tone: parsed.data.tone,
      channelPreference: parsed.data.channelPreference,
      dndStart: dnd.dndStart,
      dndEnd: dnd.dndEnd,
    });

    logCareSettingsUpdated({
      accountId: ctx.accountId,
      careRecipientId: ctx.careRecipientId,
      event: "care_settings_updated",
    });

    await revalidateAjustesPaths();

    return { ok: true, message: familyContent.ajustes.tone.saveSuccess };
  } catch {
    return { ok: false, message: copy.saveFailed };
  }
}
