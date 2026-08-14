import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountStatus } from "@/modules/accounts/domain/roles";

export interface AccountBillingSnapshot {
  plan: string;
  status: AccountStatus;
  trialEndsAt: string | null;
}

export async function fetchAccountBillingSnapshot(
  supabase: SupabaseClient,
  accountId: string,
): Promise<AccountBillingSnapshot | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("plan, status, trial_ends_at")
    .eq("id", accountId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    plan: (data.plan as string | null) ?? "essential",
    status: (data.status as AccountStatus) ?? "active",
    trialEndsAt: (data.trial_ends_at as string | null) ?? null,
  };
}

export async function countMedicationEventsInRange(
  supabase: SupabaseClient,
  careRecipientId: string,
  eventType: string,
  startIso: string,
  endIso: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("medication_events")
    .select("id", { count: "exact", head: true })
    .eq("care_recipient_id", careRecipientId)
    .eq("type", eventType)
    .gte("created_at", startIso)
    .lte("created_at", endIso);

  if (error) throw error;
  return count ?? 0;
}

export async function countActiveMembersWithLogin(
  supabase: SupabaseClient,
  accountId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("account_members")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("status", "active")
    .not("profile_id", "is", null);

  if (error) throw error;
  return count ?? 0;
}

export async function fetchTotalExamBytes(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("exams")
    .select("size_bytes")
    .eq("care_recipient_id", careRecipientId);

  if (error) throw error;
  return (data ?? []).reduce(
    (total, row) => total + Number(row.size_bytes),
    0,
  );
}
