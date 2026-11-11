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

export async function insertLocationPoint(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    lat: number;
    lng: number;
    accuracyM: number | null;
    recordedAt: string;
    source: "sos" | "periodic" | "home_confirm" | "on_demand";
  },
): Promise<string> {
  const { data, error } = await supabase
    .from("location_points")
    .insert({
      care_recipient_id: input.careRecipientId,
      lat: input.lat,
      lng: input.lng,
      accuracy_m: input.accuracyM,
      recorded_at: input.recordedAt,
      source: input.source,
      permission_active: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function fetchSosLocationPointNear(
  supabase: SupabaseClient,
  careRecipientId: string,
  triggeredAtIso: string,
): Promise<LocationPointRow | null> {
  const triggeredAt = new Date(triggeredAtIso).getTime();
  if (!Number.isFinite(triggeredAt)) return null;
  const start = new Date(triggeredAt - 60_000).toISOString();
  const end = new Date(triggeredAt + 2 * 60_000).toISOString();

  const { data, error } = await supabase
    .from("location_points")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .eq("source", "sos")
    .gte("recorded_at", start)
    .lte("recorded_at", end)
    .order("recorded_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLocationPointRow(data as Record<string, unknown>) : null;
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
