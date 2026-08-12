import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "@/modules/medications/domain/pack-end";
import type {
  MedicationEventSnapshot,
  MedicationScheduleSnapshot,
} from "@/modules/medications/domain/hoje-timeline";
import { getDayBounds, getZonedParts } from "@/modules/medications/domain/hoje-timeline";

interface PackRow {
  id: string;
  end_date_estimated: string;
  status: string;
  refill_alert_days: number | null;
}

interface MedicationRow {
  id: string;
  name: string;
  dosage_label: string;
  created_at: string;
  medication_packs: PackRow | PackRow[] | null;
  medication_schedules:
    | Array<{ times: string[] | null }>
    | { times: string[] | null }
    | null;
}

interface EventRow {
  id: string;
  type: string;
  pack_id: string | null;
  actor_profile_id: string | null;
  created_at: string;
}

function normalizePack(value: MedicationRow["medication_packs"]): PackRow | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeSchedule(
  value: MedicationRow["medication_schedules"],
): { times: string[] } | null {
  if (!value) return null;
  const row = Array.isArray(value) ? value[0] : value;
  if (!row?.times?.length) return null;
  return {
    times: row.times.map((time) => time.slice(0, 5)),
  };
}

function computeDaysRemaining(endDateIso: string, now: Date, timeZone: string): number {
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
): MedicationScheduleSnapshot | null {
  const pack = normalizePack(row.medication_packs);
  if (!pack || pack.status !== "active") return null;

  const schedule = normalizeSchedule(row.medication_schedules);
  const daysRemaining = computeDaysRemaining(
    pack.end_date_estimated,
    now,
    timeZone,
  );

  return {
    medicationId: row.id,
    medicationName: row.name,
    dosageLabel: row.dosage_label,
    times: schedule?.times ?? [],
    endDateEstimated: pack.end_date_estimated,
    daysRemaining,
    refillAlertDays: pack.refill_alert_days ?? DEFAULT_REFILL_ALERT_DAYS,
    createdAt: row.created_at,
  };
}

export interface MedicationReadResult {
  medications: MedicationScheduleSnapshot[];
  events: MedicationEventSnapshot[];
  packToMedication: Map<string, string>;
}

export async function fetchHojeMedicationData(
  supabase: SupabaseClient,
  careRecipientId: string,
  now: Date,
  timeZone: string,
): Promise<MedicationReadResult> {
  const { data: medRows, error: medError } = await supabase
    .from("medications")
    .select(
      "id, name, dosage_label, created_at, medication_packs(id, end_date_estimated, status, refill_alert_days), medication_schedules(times)",
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
      .filter((item): item is MedicationScheduleSnapshot => item !== null) ?? [];

  const packToMedication = new Map<string, string>();
  for (const row of medRows ?? []) {
    const pack = normalizePack((row as MedicationRow).medication_packs);
    if (pack?.id) {
      packToMedication.set(pack.id, row.id);
    }
  }

  const { startIso, endIso } = getDayBounds(now, timeZone);
  const { data: eventRows, error: eventError } = await supabase
    .from("medication_events")
    .select("id, type, pack_id, actor_profile_id, created_at")
    .eq("care_recipient_id", careRecipientId)
    .gte("created_at", startIso)
    .lte("created_at", endIso)
    .order("created_at", { ascending: false });

  if (eventError) {
    throw new Error(
      "Não foi possível carregar a linha do tempo agora. Tente recarregar a página.",
    );
  }

  const events: MedicationEventSnapshot[] =
    (eventRows as EventRow[] | null)?.map((event) => ({
      id: event.id,
      type: event.type,
      medicationId: event.pack_id
        ? (packToMedication.get(event.pack_id) ?? null)
        : null,
      createdAt: event.created_at,
      actorProfileId: event.actor_profile_id,
    })) ?? [];

  return { medications, events, packToMedication };
}

export interface RefillAttentionItem {
  medicationId: string;
  medicationName: string;
  endDateEstimated: string;
  buyUntilDate: string;
  daysRemaining: number;
}

export function mapRefillAttentionItems(
  medications: MedicationScheduleSnapshot[],
): RefillAttentionItem[] {
  return medications
    .filter((med) => shouldWarnRefill(med.daysRemaining, med.refillAlertDays))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .map((med) => ({
      medicationId: med.medicationId,
      medicationName: med.medicationName,
      endDateEstimated: med.endDateEstimated,
      buyUntilDate: med.endDateEstimated,
      daysRemaining: med.daysRemaining,
    }));
}
