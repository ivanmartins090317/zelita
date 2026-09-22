import type { SupabaseClient } from "@supabase/supabase-js";

import { isAccountPaused, type AccountStatus } from "@/modules/accounts/domain/roles";
import { DEFAULT_REFILL_ALERT_DAYS } from "@/modules/medications";
import {
  calendarDaysUntil,
  dateKeyInZone,
  slotsOnDate,
  type DaySlot,
} from "@/modules/reminders/domain/zoned-time";

export interface ActiveReminderSlot {
  careRecipientId: string;
  packId: string;
  medicationId: string;
  medicationLabel: string;
  slot: DaySlot;
  nextSlotAt?: string;
}

export interface ActiveRefillPack {
  packId: string;
  careRecipientId: string;
  accountId: string;
  medicationName: string;
  dosageLabel: string;
  daysRemaining: number;
  refillAlertDays: number;
}

interface CareRecipientJoin {
  id: string;
  account_id: string;
  accounts: { status?: AccountStatus } | Array<{ status?: AccountStatus }> | null;
}

interface MedicationJoin {
  id: string;
  name: string;
  dosage_label: string;
  active: boolean;
  care_recipient_id: string;
  medication_schedules: Array<{ times: string[] }> | { times: string[] } | null;
  care_recipients: CareRecipientJoin | CareRecipientJoin[] | null;
}

interface PackQueryRow {
  id: string;
  status: string;
  end_date_estimated: string | null;
  refill_alert_days: number | null;
  medication_id: string;
  medications: MedicationJoin | MedicationJoin[] | null;
}

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function listActiveReminderSlots(
  supabase: SupabaseClient,
  now: Date,
): Promise<ActiveReminderSlot[]> {
  const packs = await loadActivePacks(supabase);
  const dateKey = dateKeyInZone(now);
  const result: ActiveReminderSlot[] = [];

  for (const pack of packs) {
    const medication = first(pack.medications);
    if (!medication || !medication.active) continue;
    const recipient = first(medication.care_recipients);
    if (!recipient) continue;
    const account = first(recipient.accounts);
    if (account?.status && isAccountPaused(account.status)) continue;

    const schedule = first(medication.medication_schedules);
    const times = (schedule?.times ?? []).map((time) => String(time).slice(0, 5));
    const daySlots = slotsOnDate(times, dateKey);

    daySlots.forEach((slot, index) => {
      const next = daySlots[index + 1];
      result.push({
        careRecipientId: recipient.id,
        packId: pack.id,
        medicationId: medication.id,
        medicationLabel: `${medication.name} ${medication.dosage_label}`,
        slot,
        nextSlotAt: next?.scheduledAt.toISOString(),
      });
    });
  }

  return result;
}

export async function listActiveRefillPacks(
  supabase: SupabaseClient,
  now: Date,
): Promise<ActiveRefillPack[]> {
  const packs = await loadActivePacks(supabase);
  const result: ActiveRefillPack[] = [];

  for (const pack of packs) {
    const medication = first(pack.medications);
    if (!medication || !medication.active || !pack.end_date_estimated) continue;
    const recipient = first(medication.care_recipients);
    if (!recipient) continue;
    const account = first(recipient.accounts);
    if (account?.status && isAccountPaused(account.status)) continue;

    const end = new Date(`${pack.end_date_estimated}T12:00:00.000-03:00`);
    result.push({
      packId: pack.id,
      careRecipientId: recipient.id,
      accountId: recipient.account_id,
      medicationName: medication.name,
      dosageLabel: medication.dosage_label,
      daysRemaining: calendarDaysUntil(end, now),
      refillAlertDays: pack.refill_alert_days ?? DEFAULT_REFILL_ALERT_DAYS,
    });
  }

  return result;
}

async function loadActivePacks(supabase: SupabaseClient): Promise<PackQueryRow[]> {
  const { data, error } = await supabase
    .from("medication_packs")
    .select(
      "id, status, end_date_estimated, refill_alert_days, medication_id, medications(id, name, dosage_label, active, care_recipient_id, medication_schedules(times), care_recipients(id, account_id, accounts(status)))",
    )
    .eq("status", "active");

  if (error) {
    throw new Error(
      `Falha ao listar cartelas ativas: ${error.message}. Confira o service role.`,
    );
  }

  return (data ?? []) as PackQueryRow[];
}

export async function hasRefillEventToday(
  supabase: SupabaseClient,
  packId: string,
  eventType: string,
  dateKey: string,
): Promise<boolean> {
  const start = `${dateKey}T00:00:00.000-03:00`;
  const end = `${dateKey}T23:59:59.999-03:00`;
  const { data, error } = await supabase
    .from("medication_events")
    .select("id")
    .eq("pack_id", packId)
    .eq("type", eventType)
    .gte("created_at", start)
    .lte("created_at", end)
    .limit(1);

  if (error) {
    throw new Error(`Falha ao checar aviso de cartela: ${error.message}.`);
  }
  return Boolean(data && data.length > 0);
}
