"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminForMedications } from "@/modules/accounts/application/family-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scheduleMedicationReminders } from "@/modules/reminders/application/schedule-reminders";
import {
  INVALID_SCHEDULE_TIMES_MESSAGE,
  parseScheduleTimes,
} from "@/modules/medications/application/schedule-times";

import type { MedicationActionResult } from "./medication-actions";

const updateSchema = z.object({
  medicationId: z.string().uuid(),
  times: z.string().min(1),
});

const RETRY_MESSAGE =
  "Não foi possível salvar os horários agora. Atualize a página e tente de novo.";

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function updateMedicationSchedule(
  _prev: MedicationActionResult,
  formData: FormData,
): Promise<MedicationActionResult> {
  const parsed = updateSchema.safeParse({
    medicationId: formData.get("medicationId"),
    times: formData.get("times"),
  });
  if (!parsed.success) {
    return { ok: false, message: INVALID_SCHEDULE_TIMES_MESSAGE };
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
    .select(
      "id, name, dosage_label, medication_schedules(doses_per_day), medication_packs(id, status)",
    )
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

  const schedule = Array.isArray(medication.medication_schedules)
    ? medication.medication_schedules[0]
    : medication.medication_schedules;
  const dosesPerDay = schedule?.doses_per_day;
  if (!dosesPerDay) {
    return {
      ok: false,
      message: "Este remédio não tem doses por dia para editar os horários.",
    };
  }

  const times = parseScheduleTimes(parsed.data.times, dosesPerDay);
  if (!times) {
    return { ok: false, message: INVALID_SCHEDULE_TIMES_MESSAGE };
  }

  const { error: updateError } = await supabase
    .from("medication_schedules")
    .update({ times })
    .eq("medication_id", medication.id);

  if (updateError) {
    return {
      ok: false,
      message: `Falha ao salvar horários: ${updateError.message}.`,
    };
  }

  const packs = Array.isArray(medication.medication_packs)
    ? medication.medication_packs
    : medication.medication_packs
      ? [medication.medication_packs]
      : [];
  const activePack = packs.find((pack) => pack.status === "active");

  if (activePack) {
    await scheduleMedicationReminders({
      medicationId: medication.id,
      packId: activePack.id,
      careRecipientId,
      times,
      medicationLabel: `${medication.name} ${medication.dosage_label}`,
    });
  }

  revalidatePath("/familia");
  revalidatePath("/familia/remedios");
  revalidatePath("/familia/consultas");

  redirect(`/familia/remedios?remedio=${medication.id}`);
}
