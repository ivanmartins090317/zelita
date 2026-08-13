import type { SupabaseClient } from "@supabase/supabase-js";

export interface SafePlaceRow {
  id: string;
  careRecipientId: string;
  name: string;
  addressText: string | null;
  lat: number | null;
  lng: number | null;
  radiusM: number;
  isHome: boolean;
  alertOnExit: boolean;
  icon: string | null;
  coordsConfirmedAt: string | null;
  createdAt: string;
}

function mapSafePlaceRow(row: Record<string, unknown>): SafePlaceRow {
  return {
    id: row.id as string,
    careRecipientId: row.care_recipient_id as string,
    name: row.name as string,
    addressText: (row.address_text as string | null) ?? null,
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
    radiusM: row.radius_m as number,
    isHome: row.is_home as boolean,
    alertOnExit: (row.alert_on_exit as boolean) ?? false,
    icon: (row.icon as string | null) ?? null,
    coordsConfirmedAt: (row.coords_confirmed_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function fetchSafePlacesForCareRecipient(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<SafePlaceRow[]> {
  const { data, error } = await supabase
    .from("safe_places")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("is_home", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapSafePlaceRow(row as Record<string, unknown>));
}

export async function fetchSafePlaceById(
  supabase: SupabaseClient,
  placeId: string,
): Promise<SafePlaceRow | null> {
  const { data, error } = await supabase
    .from("safe_places")
    .select("*")
    .eq("id", placeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapSafePlaceRow(data as Record<string, unknown>) : null;
}

export async function insertSafePlace(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    name: string;
    addressText: string;
    radiusM: number;
    icon?: string | null;
    alertOnExit?: boolean;
  },
): Promise<SafePlaceRow> {
  const { data, error } = await supabase
    .from("safe_places")
    .insert({
      care_recipient_id: input.careRecipientId,
      name: input.name,
      address_text: input.addressText,
      radius_m: input.radiusM,
      icon: input.icon ?? null,
      alert_on_exit: input.alertOnExit ?? false,
      is_home: false,
    })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Falha ao criar lugar.");
  return mapSafePlaceRow(data as Record<string, unknown>);
}

export async function updateSafePlaceRecord(
  supabase: SupabaseClient,
  placeId: string,
  input: {
    name?: string;
    addressText?: string;
    radiusM?: number;
    icon?: string | null;
    alertOnExit?: boolean;
  },
): Promise<SafePlaceRow> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.addressText !== undefined) payload.address_text = input.addressText;
  if (input.radiusM !== undefined) payload.radius_m = input.radiusM;
  if (input.icon !== undefined) payload.icon = input.icon;
  if (input.alertOnExit !== undefined) payload.alert_on_exit = input.alertOnExit;

  const { data, error } = await supabase
    .from("safe_places")
    .update(payload)
    .eq("id", placeId)
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Falha ao atualizar lugar.");
  return mapSafePlaceRow(data as Record<string, unknown>);
}

export async function deleteSafePlaceRecord(
  supabase: SupabaseClient,
  placeId: string,
): Promise<void> {
  const { error } = await supabase.from("safe_places").delete().eq("id", placeId);
  if (error) throw new Error(error.message);
}

export async function fetchHomePlace(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<SafePlaceRow | null> {
  const { data, error } = await supabase
    .from("safe_places")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .eq("is_home", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapSafePlaceRow(data as Record<string, unknown>) : null;
}
