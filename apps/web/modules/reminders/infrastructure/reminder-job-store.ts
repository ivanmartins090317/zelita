import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountStatus } from "@/modules/accounts/domain/roles";
import { hasProcessedOccurrence } from "@/modules/reminders/domain/reminder-idempotency";

export interface ReminderRecipientRow {
  id: string;
  displayName: string;
  whatsapp: string;
  dndStart: string | null;
  dndEnd: string | null;
  waOptInAt: string | null;
  accountId: string;
  accountStatus: AccountStatus | null;
}

export async function loadReminderRecipient(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<ReminderRecipientRow | null> {
  const { data, error } = await supabase
    .from("care_recipients")
    .select(
      "id, display_name, whatsapp, dnd_start, dnd_end, wa_opt_in_at, account_id, accounts(status)",
    )
    .eq("id", careRecipientId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Falha ao ler pessoa cuidada: ${error.message}. Confira o service role.`,
    );
  }
  if (!data) return null;

  const accounts = Array.isArray(data.accounts)
    ? data.accounts[0]
    : data.accounts;

  return {
    id: data.id,
    displayName: data.display_name,
    whatsapp: data.whatsapp ?? "",
    dndStart: data.dnd_start ? String(data.dnd_start).slice(0, 5) : null,
    dndEnd: data.dnd_end ? String(data.dnd_end).slice(0, 5) : null,
    waOptInAt: data.wa_opt_in_at,
    accountId: data.account_id,
    accountStatus: (accounts as { status?: AccountStatus } | null)?.status ?? null,
  };
}

export async function loadPackScheduleTimes(
  supabase: SupabaseClient,
  packId: string,
): Promise<string[] | null> {
  const { data, error } = await supabase
    .from("medication_packs")
    .select("medications(medication_schedules(times))")
    .eq("id", packId)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao ler horários da cartela: ${error.message}.`);
  }
  if (!data) return null;

  const medication = Array.isArray(data.medications)
    ? data.medications[0]
    : data.medications;
  if (!medication) return null;

  const schedules = medication.medication_schedules;
  const schedule = Array.isArray(schedules) ? schedules[0] : schedules;
  if (!schedule?.times?.length) return null;

  return schedule.times.map((time: string) => String(time).slice(0, 5));
}

export async function medicationPackExists(
  supabase: SupabaseClient,
  packId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("medication_packs")
    .select("id")
    .eq("id", packId)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao ler a cartela: ${error.message}.`);
  }

  return Boolean(data);
}

export async function hasReminderOccurrence(
  supabase: SupabaseClient,
  packId: string,
  scheduledAt: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("medication_events")
    .select("pack_id, type, payload")
    .eq("pack_id", packId)
    .in("type", ["reminder_sent", "reminder_skipped"]);

  if (error) {
    throw new Error(
      `Falha ao checar idempotência do lembrete: ${error.message}.`,
    );
  }

  return hasProcessedOccurrence(
    (data ?? []).map((row) => ({
      packId: row.pack_id as string,
      type: row.type as string,
      scheduledAt:
        typeof row.payload === "object" &&
        row.payload &&
        "scheduledAt" in row.payload
          ? String((row.payload as { scheduledAt?: string }).scheduledAt)
          : null,
    })),
    packId,
    scheduledAt,
  );
}

export async function insertMedicationEvent(
  supabase: SupabaseClient,
  input: {
    packId?: string;
    careRecipientId: string;
    type: string;
    channel: string;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabase.from("medication_events").insert({
    pack_id: input.packId ?? null,
    care_recipient_id: input.careRecipientId,
    type: input.type,
    channel: input.channel,
    payload: input.payload,
  });
  if (error) {
    throw new Error(`Falha ao gravar evento de cuidado: ${error.message}.`);
  }
}

export async function findAdminEmail(
  supabase: SupabaseClient,
  accountId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("account_members")
    .select("profile_id")
    .eq("account_id", accountId)
    .eq("role", "admin")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error || !data?.profile_id) return null;

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(data.profile_id);
  if (userError) return null;
  return userData.user.email ?? null;
}
