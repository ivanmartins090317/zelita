"use server";

import { z } from "zod";

import { familyContent } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canEditCareSettings } from "./can-edit-care-settings";
import {
  DATA_SUBJECT_REQUEST_TYPE,
  insertDataSubjectRequest,
  logDataSubjectRequestCreated,
  type DataSubjectRequestType,
} from "../infrastructure/data-subject-request-repo";

export interface SubmitDataSubjectRequestResult {
  ok: boolean;
  message?: string;
}

const requestSchema = z.object({
  requestType: z.enum([
    DATA_SUBJECT_REQUEST_TYPE.export,
    DATA_SUBJECT_REQUEST_TYPE.delete,
  ] as [DataSubjectRequestType, DataSubjectRequestType]),
  confirmed: z.literal("true"),
});

export async function submitDataSubjectRequestAction(
  _prev: SubmitDataSubjectRequestResult,
  formData: FormData,
): Promise<SubmitDataSubjectRequestResult> {
  const copy = familyContent.ajustes.errors;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role) {
      return { ok: false, message: copy.forbidden };
    }
    if (!canEditCareSettings(ctx.role)) {
      return { ok: false, message: copy.forbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.accountPaused };
    }

    const parsed = requestSchema.safeParse({
      requestType: formData.get("requestType"),
      confirmed: formData.get("confirmed"),
    });

    if (!parsed.success) {
      return { ok: false, message: copy.invalidPayload };
    }

    const supabase = await createSupabaseServerClient();
    await insertDataSubjectRequest(supabase, {
      accountId: ctx.accountId,
      requesterProfileId: ctx.userId,
      requestType: parsed.data.requestType,
    });

    logDataSubjectRequestCreated({
      accountId: ctx.accountId,
      requestType: parsed.data.requestType,
      event: "data_subject_request_created",
    });

    return {
      ok: true,
      message: familyContent.ajustes.lgpdModal.successMessage,
    };
  } catch {
    return { ok: false, message: copy.saveFailed };
  }
}
