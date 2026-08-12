import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "@/modules/medications/domain/pack-end";
import { getZonedParts } from "@/modules/medications/domain/hoje-timeline";

interface PackRow {
  id: string;
  quantity_total: number;
  quantity_remaining: number;
  start_date: string;
  end_date_estimated: string;
  refill_alert_days: number | null;
  status: string;
  created_at: string;
}

interface ScheduleRow {
  times: string[] | null;
  dose_units: number;
  doses_per_day: number;
  instructions: string | null;
}

interface MedicationRow {
  id: string;
  name: string;
  dosage_label: string;
  active: boolean;
  created_at: string;
  medication_packs: PackRow | PackRow[] | null;
  medication_schedules: ScheduleRow | ScheduleRow[] | null;
}

interface EventRow {
  id: string;
  type: string;
  pack_id: string | null;
  actor_profile_id: string | null;
  created_at: string;
}

export interface RemediosPackSnapshot {
  id: string;
  quantityTotal: number;
  quantityRemaining: number;
  startDate: string;
  endDateEstimated: string;
  refillAlertDays: number;
  status: string;
}

export interface RemediosMedicationSnapshot {
  medicationId: string;
  name: string;
  dosageLabel: string;
  times: string[];
  doseUnits: number;
  dosesPerDay: number;
  instructions: string | null;
  daysRemaining: number;
  refillAlertDays: number;
  pack: RemediosPackSnapshot;
}

export interface RemediosEventSnapshot {
  id: string;
  type: string;
  packId: string | null;
  medicationId: string | null;
  actorProfileId: string | null;
  createdAt: string;
}

export interface RemediosPageData {
  medications: RemediosMedicationSnapshot[];
  events: RemediosEventSnapshot[];
}

function normalizePack(value: MedicationRow["medication_packs"]): PackRow | null {
  if (!value) return null;
  const rows = Array.isArray(value) ? value : [value];
  return (
    rows.find((pack) => pack.status === "active") ??
    rows.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0] ??
    null
  );
}

function normalizeSchedule(
  value: MedicationRow["medication_schedules"],
): ScheduleRow | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function computeDaysRemaining(
  endDateIso: string,
  now: Date,
  timeZone: string,
): number {
  const endParts = endDateIso.split("-").map(Number);
  const endUtc = Date.UTC(endParts[0], (endParts[1] ?? 1) - 1, endParts[2] ?? 1);
  const today = getZonedParts(now, timeZone);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((endUtc - todayUtc) / (24 * 60 * 60 * 1000));
}

function mapMedicationRow(
  row: MedicationRow,
  now: Date,
  timeZone: string,
): RemediosMedicationSnapshot | null {
  if (!row.active) return null;

  const pack = normalizePack(row.medication_packs);
  if (!pack || pack.status !== "active") return null;

  const schedule = normalizeSchedule(row.medication_schedules);
  const refillAlertDays = pack.refill_alert_days ?? DEFAULT_REFILL_ALERT_DAYS;

  return {
    medicationId: row.id,
    name: row.name,
    dosageLabel: row.dosage_label,
    times: schedule?.times?.map((time) => time.slice(0, 5)) ?? [],
    doseUnits: Number(schedule?.dose_units ?? 1),
    dosesPerDay: schedule?.doses_per_day ?? 1,
    instructions: schedule?.instructions ?? null,
    daysRemaining: computeDaysRemaining(pack.end_date_estimated, now, timeZone),
    refillAlertDays,
    pack: {
      id: pack.id,
      quantityTotal: Number(pack.quantity_total),
      quantityRemaining: Number(pack.quantity_remaining),
      startDate: pack.start_date,
      endDateEstimated: pack.end_date_estimated,
      refillAlertDays,
      status: pack.status,
    },
  };
}

export async function fetchRemediosPageData(
  supabase: SupabaseClient,
  careRecipientId: string,
  now: Date,
  timeZone: string,
): Promise<RemediosPageData> {
  const { data: medRows, error: medError } = await supabase
    .from("medications")
    .select(
      "id, name, dosage_label, active, created_at, medication_packs(id, quantity_total, quantity_remaining, start_date, end_date_estimated, refill_alert_days, status, created_at), medication_schedules(times, dose_units, doses_per_day, instructions)",
    )
    .eq("care_recipient_id", careRecipientId)
    .eq("active", true);

  if (medError) {
    throw new Error(
      "Não foi possível carregar os remédios agora. Tente recarregar a página.",
    );
  }

  const medications =
    medRows
      ?.map((row) => mapMedicationRow(row as MedicationRow, now, timeZone))
      .filter((item): item is RemediosMedicationSnapshot => item !== null) ?? [];

  const packToMedication = new Map<string, string>();
  for (const med of medications) {
    packToMedication.set(med.pack.id, med.medicationId);
  }

  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - 7);

  const { data: eventRows, error: eventError } = await supabase
    .from("medication_events")
    .select("id, type, pack_id, actor_profile_id, created_at")
    .eq("care_recipient_id", careRecipientId)
    .gte("created_at", since.toISOString())
    .in("type", [
      "reminder_sent",
      "manual_confirmation",
      "pack_refill_warning",
      "voice_fallback",
      "pack_last_day",
    ])
    .order("created_at", { ascending: false });

  if (eventError) {
    throw new Error(
      "Não foi possível carregar os lembretes agora. Tente recarregar a página.",
    );
  }

  const events: RemediosEventSnapshot[] =
    (eventRows as EventRow[] | null)?.map((event) => ({
      id: event.id,
      type: event.type,
      packId: event.pack_id,
      medicationId: event.pack_id
        ? (packToMedication.get(event.pack_id) ?? null)
        : null,
      actorProfileId: event.actor_profile_id,
      createdAt: event.created_at,
    })) ?? [];

  return { medications, events };
}

export async function countActiveMedications(
  supabase: SupabaseClient,
  careRecipientId: string,
  now: Date,
  timeZone: string,
): Promise<number> {
  const { medications } = await fetchRemediosPageData(
    supabase,
    careRecipientId,
    now,
    timeZone,
  );
  return medications.length;
}

export function findMostUrgentRefill(
  medications: RemediosMedicationSnapshot[],
): RemediosMedicationSnapshot | null {
  const urgent = medications
    .filter((med) => shouldWarnRefill(med.daysRemaining, med.refillAlertDays))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
  return urgent[0] ?? null;
}
