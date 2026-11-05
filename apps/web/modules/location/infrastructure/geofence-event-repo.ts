import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseGeofenceEventType,
  type GeofenceEventType,
} from "../domain/location-history-labels";

export interface GeofenceEventRow {
  id: string;
  careRecipientId: string;
  safePlaceId: string | null;
  eventType: GeofenceEventType;
  placeName: string;
  recordedAt: string;
}

function mapGeofenceEventRow(row: Record<string, unknown>): GeofenceEventRow {
  const eventType = parseGeofenceEventType(row.event_type as string);
  if (!eventType) {
    throw new Error("Tipo de evento de zona inválido.");
  }

  return {
    id: row.id as string,
    careRecipientId: row.care_recipient_id as string,
    safePlaceId: (row.safe_place_id as string | null) ?? null,
    eventType,
    placeName: row.place_name as string,
    recordedAt: row.recorded_at as string,
  };
}

export async function insertGeofenceEvent(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    safePlaceId: string;
    eventType: "zone_exit" | "zone_return";
    placeName: string;
    recordedAt: string;
  },
): Promise<void> {
  const { error } = await supabase.from("geofence_events").insert({
    care_recipient_id: input.careRecipientId,
    safe_place_id: input.safePlaceId,
    event_type: input.eventType,
    place_name: input.placeName,
    recorded_at: input.recordedAt,
  });

  if (error) throw new Error(error.message);
}

export async function fetchLatestZoneBoundary(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<GeofenceEventRow | null> {
  const { data, error } = await supabase
    .from("geofence_events")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .in("event_type", ["zone_exit", "zone_return"])
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapGeofenceEventRow(data as Record<string, unknown>) : null;
}

export async function fetchGeofenceEventsSince(
  supabase: SupabaseClient,
  careRecipientId: string,
  sinceIso: string,
  limit = 50,
): Promise<GeofenceEventRow[]> {
  const { data, error } = await supabase
    .from("geofence_events")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .gte("recorded_at", sinceIso)
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) =>
    mapGeofenceEventRow(row as Record<string, unknown>),
  );
}
