"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminForMedications } from "@/modules/accounts/application/family-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const deleteSchema = z.object({
  medicationId: z.string().uuid(),
});

export interface DeleteMedicationResult {
  ok: boolean;
  message?: string;
}

const RETRY_MESSAGE =
  "Não foi possível apagar agora. Atualize a página e tente de novo.";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function deleteMedication(
  medicationId: string,
): Promise<DeleteMedicationResult> {
  const parsed = deleteSchema.safeParse({ medicationId });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Não encontramos esse remédio. Atualize a página e tente de novo.",
    };
  }

  let careRecipientId: string;
  try {
    const ctx = await requireAdminForMedications();
    if (!ctx.careRecipientId) {
      return {
        ok: false,
        message: "Não encontramos a pessoa cuidada desta conta.",
      };
    }
    careRecipientId = ctx.careRecipientId;
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : RETRY_MESSAGE,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: medication, error: readError } = await supabase
    .from("medications")
    .select("id")
    .eq("id", parsed.data.medicationId)
    .eq("care_recipient_id", careRecipientId)
    .maybeSingle();

  if (readError || !medication) {
    return {
      ok: false,
      message:
        "Não encontramos esse remédio nesta conta. Atualize a página e tente de novo.",
    };
  }

  const { error: deleteError } = await supabase
    .from("medications")
    .delete()
    .eq("id", medication.id)
    .eq("care_recipient_id", careRecipientId);

  if (deleteError) {
    return { ok: false, message: RETRY_MESSAGE };
  }

  revalidatePath("/familia");
  revalidatePath("/familia/remedios");
  revalidatePath("/familia/avisos");
  return { ok: true };
}
