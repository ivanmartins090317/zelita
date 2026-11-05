import type { SupabaseClient } from "@supabase/supabase-js";

export interface SosNotificationAttemptRow {
  id: string;
  sosAlertId: string;
  profileId: string | null;
  displayName: string;
  channel: "whatsapp" | "call" | "email";
  status:
    | "pending"
    | "sent"
    | "delivered"
    | "read"
    | "answered"
    | "failed";
  attemptedAt: string;
}

function mapNotificationRow(row: Record<string, unknown>): SosNotificationAttemptRow {
  return {
    id: row.id as string,
    sosAlertId: row.sos_alert_id as string,
    profileId: (row.profile_id as string | null) ?? null,
    displayName: row.display_name as string,
    channel: row.channel as SosNotificationAttemptRow["channel"],
    status: row.status as SosNotificationAttemptRow["status"],
    attemptedAt: row.attempted_at as string,
  };
}

export async function insertSosNotificationAttempt(
  supabase: SupabaseClient,
  input: {
    sosAlertId: string;
    profileId: string | null;
    displayName: string;
    channel: "email";
    status: "sent" | "failed";
    attemptedAt: string;
  },
): Promise<void> {
  const { error } = await supabase.from("sos_notification_attempts").insert({
    sos_alert_id: input.sosAlertId,
    profile_id: input.profileId,
    display_name: input.displayName,
    channel: input.channel,
    status: input.status,
    attempted_at: input.attemptedAt,
  });

  if (error) throw new Error(error.message);
}

export async function fetchNotificationAttemptsForAlert(
  supabase: SupabaseClient,
  alertId: string,
): Promise<SosNotificationAttemptRow[]> {
  const { data, error } = await supabase
    .from("sos_notification_attempts")
    .select("*")
    .eq("sos_alert_id", alertId)
    .order("attempted_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapNotificationRow(row as Record<string, unknown>),
  );
}

export async function fetchNotificationAttemptsForAlerts(
  supabase: SupabaseClient,
  alertIds: string[],
): Promise<Map<string, SosNotificationAttemptRow[]>> {
  if (alertIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("sos_notification_attempts")
    .select("*")
    .in("sos_alert_id", alertIds)
    .order("attempted_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, SosNotificationAttemptRow[]>();
  for (const row of data ?? []) {
    const mapped = mapNotificationRow(row as Record<string, unknown>);
    const list = map.get(mapped.sosAlertId) ?? [];
    list.push(mapped);
    map.set(mapped.sosAlertId, list);
  }

  return map;
}
