"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminForMedications } from "@/modules/accounts/application/family-context";
import {
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
} from "@/modules/medications/domain/pack-end";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scheduleMedicationReminders } from "@/modules/reminders/application/schedule-reminders";

const createSchema = z.object({
  careRecipientId: z.string().uuid(),
  name: z.string().min(2),
  dosageLabel: z.string().min(1),
  quantityTotal: z.coerce.number().positive(),
  doseUnits: z.coerce.number().positive(),
  dosesPerDay: z.coerce.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  times: z.string().min(1),
  instructions: z.string().optional(),
});

export interface MedicationActionResult {
  ok: boolean;
  message?: string;
  endDateEstimated?: string;
}

export async function previewPackEnd(
  quantityTotal: number,
  doseUnits: number,
  dosesPerDay: number,
  startDate: string,
): Promise<MedicationActionResult> {
  try {
    const result = computePackEnd({
      quantityTotal,
      doseUnits,
      dosesPerDay,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
    });
    return {
      ok: true,
      endDateEstimated: result.endDateEstimated.toISOString().slice(0, 10),
      message: `Cartela prevista para terminar em ${result.endDateEstimated.toISOString().slice(0, 10)} (${result.daysRemaining} dias). Isso não confirma tomada.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Falha no cálculo.",
    };
  }
}

export async function createMedicationWithPack(
  _prev: MedicationActionResult,
  formData: FormData,
): Promise<MedicationActionResult> {
  const parsed = createSchema.safeParse({
    careRecipientId: formData.get("careRecipientId"),
    name: formData.get("name"),
    dosageLabel: formData.get("dosageLabel"),
    quantityTotal: formData.get("quantityTotal"),
    doseUnits: formData.get("doseUnits"),
    dosesPerDay: formData.get("dosesPerDay"),
    startDate: formData.get("startDate"),
    times: formData.get("times"),
    instructions: formData.get("instructions") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const ctx = await requireAdminForMedications();
  if (ctx.careRecipientId !== parsed.data.careRecipientId) {
    return {
      ok: false,
      message: "Pessoa cuidada inválida para esta conta.",
    };
  }

  const times = parsed.data.times
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (times.length === 0 || times.length !== parsed.data.dosesPerDay) {
    return {
      ok: false,
      message:
        "Informe os horários separados por vírgula, um por dose do dia (ex.: 08:00,20:00).",
    };
  }

  let packEnd;
  try {
    packEnd = computePackEnd({
      quantityTotal: parsed.data.quantityTotal,
      doseUnits: parsed.data.doseUnits,
      dosesPerDay: parsed.data.dosesPerDay,
      startDate: new Date(`${parsed.data.startDate}T00:00:00.000Z`),
    });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Cálculo inválido.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: medication, error: medError } = await supabase
    .from("medications")
    .insert({
      care_recipient_id: parsed.data.careRecipientId,
      name: parsed.data.name,
      dosage_label: parsed.data.dosageLabel,
      active: true,
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  if (medError || !medication) {
    return {
      ok: false,
      message: `Falha ao salvar remédio: ${medError?.message ?? "sem retorno"}.`,
    };
  }

  const { error: scheduleError } = await supabase
    .from("medication_schedules")
    .insert({
      medication_id: medication.id,
      times,
      dose_units: parsed.data.doseUnits,
      doses_per_day: parsed.data.dosesPerDay,
      instructions: parsed.data.instructions ?? null,
    });

  if (scheduleError) {
    return {
      ok: false,
      message: `Falha ao salvar horários: ${scheduleError.message}.`,
    };
  }

  const { data: pack, error: packError } = await supabase
    .from("medication_packs")
    .insert({
      medication_id: medication.id,
      quantity_total: parsed.data.quantityTotal,
      quantity_remaining: parsed.data.quantityTotal,
      start_date: parsed.data.startDate,
      end_date_estimated: packEnd.endDateEstimated.toISOString().slice(0, 10),
      refill_alert_days: DEFAULT_REFILL_ALERT_DAYS,
      status: "active",
    })
    .select("id")
    .single();

  if (packError || !pack) {
    return {
      ok: false,
      message: `Falha ao salvar cartela: ${packError?.message ?? "sem retorno"}.`,
    };
  }

  await scheduleMedicationReminders({
    medicationId: medication.id,
    packId: pack.id,
    careRecipientId: parsed.data.careRecipientId,
    times,
    medicationLabel: `${parsed.data.name} ${parsed.data.dosageLabel}`,
  });

  revalidatePath("/familia");
  revalidatePath("/familia/remedios");

  return {
    ok: true,
    endDateEstimated: packEnd.endDateEstimated.toISOString().slice(0, 10),
    message: "Remédio anotado. Lembrete enviado ≠ tomada confirmada.",
  };
}

export async function pauseMedicationPack(
  packId: string,
): Promise<MedicationActionResult> {
  await requireAdminForMedications();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("medication_packs")
    .update({ status: "paused" })
    .eq("id", packId);

  if (error) {
    return { ok: false, message: `Não foi possível pausar: ${error.message}.` };
  }

  revalidatePath("/familia");
  revalidatePath("/familia/remedios");
  return { ok: true, message: "Cartela pausada. Lembretes desta cartela param." };
}
