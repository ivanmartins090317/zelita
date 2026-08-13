import type { SupabaseClient } from "@supabase/supabase-js";

export interface LocationPointRow {
  id: string;
  careRecipientId: string;
  lat: number | null;
  lng: number | null;
  locationText: string | null;
  accuracyM: number | null;
  recordedAt: string;
  source: string;
  batteryPct: number | null;
  signalQuality: string | null;
  permissionActive: boolean | null;
}

function mapLocationPointRow(row: Record<string, unknown>): LocationPointRow {
  return {
    id: row.id as string,
    careRecipientId: row.care_recipient_id as string,
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
    locationText: (row.location_text as string | null) ?? null,
    accuracyM: (row.accuracy_m as number | null) ?? null,
    recordedAt: row.recorded_at as string,
    source: row.source as string,
    batteryPct: (row.battery_pct as number | null) ?? null,
    signalQuality: (row.signal_quality as string | null) ?? null,
    permissionActive: (row.permission_active as boolean | null) ?? null,
  };
}

export async function fetchLatestLocationPoint(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<LocationPointRow | null> {
  const { data, error } = await supabase
    .from("location_points")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLocationPointRow(data as Record<string, unknown>) : null;
}

export async function fetchLocationPointsSince(
  supabase: SupabaseClient,
  careRecipientId: string,
  sinceIso: string,
): Promise<LocationPointRow[]> {
  const { data, error } = await supabase
    .from("location_points")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .gte("recorded_at", sinceIso)
    .order("recorded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    mapLocationPointRow(row as Record<string, unknown>),
  );
}
