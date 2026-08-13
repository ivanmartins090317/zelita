import type { SupabaseClient } from "@supabase/supabase-js";

import type { NotificationAlertType, NotificationChannel } from "../domain/alert-feed-types";

export interface NotificationPreferenceRow {
  memberId: string;
  alertType: NotificationAlertType;
  channels: NotificationChannel[];
}

function parseAlertType(value: string): NotificationAlertType | null {
  if (
    value === "sos" ||
    value === "pack_refill" ||
    value === "zone_exit" ||
    value === "reminder_unread"
  ) {
    return value;
  }
  return null;
}

function parseChannel(value: string): NotificationChannel | null {
  if (
    value === "panel" ||
    value === "email" ||
    value === "whatsapp" ||
    value === "call"
  ) {
    return value;
  }
  return null;
}

function mapPreferenceRow(row: Record<string, unknown>): NotificationPreferenceRow {
  const alertType = parseAlertType(row.alert_type as string);
  if (!alertType) {
    throw new Error("Tipo de aviso inválido nas preferências.");
  }

  const rawChannels = (row.channels as string[] | null) ?? [];
  const channels = rawChannels
    .map((channel) => parseChannel(channel))
    .filter((channel): channel is NotificationChannel => channel !== null);

  return {
    memberId: row.member_id as string,
    alertType,
    channels,
  };
}

export async function fetchNotificationPreferences(
  supabase: SupabaseClient,
  accountId: string,
): Promise<NotificationPreferenceRow[]> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("member_id, alert_type, channels")
    .eq("account_id", accountId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) =>
    mapPreferenceRow(row as Record<string, unknown>),
  );
}

export async function upsertNotificationPreferences(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    memberId: string;
    preferences: Array<{
      alertType: NotificationAlertType;
      channels: NotificationChannel[];
    }>;
    updatedAt: string;
  },
): Promise<void> {
  const rows = input.preferences.map((pref) => ({
    account_id: input.accountId,
    member_id: input.memberId,
    alert_type: pref.alertType,
    channels: pref.channels,
    updated_at: input.updatedAt,
  }));

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(rows, { onConflict: "account_id,member_id,alert_type" });

  if (error) {
    throw new Error(error.message);
  }
}

export function logNotificationPrefsUpdated(payload: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[alerts] notification_prefs_updated", payload);
  }
}
