import type { SupabaseClient } from "@supabase/supabase-js";

import {
  LOCATION_REQUEST_CLOSE_REASON,
  LOCATION_REQUEST_STATUS,
  type LocationRequestCloseReason,
  type LocationRequestSnapshot,
  type LocationRequestStatus,
} from "../domain/location-request";

export interface LocationRequestRow extends LocationRequestSnapshot {
  id: string;
  accountId: string;
  careRecipientId: string;
  requestedBy: string;
  locationPointId: string | null;
}

function mapLocationRequestRow(row: Record<string, unknown>): LocationRequestRow {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    careRecipientId: row.care_recipient_id as string,
    requestedBy: row.requested_by as string,
    status: row.status as LocationRequestStatus,
    requestedAt: row.requested_at as string,
    expiresAt: row.expires_at as string,
    completedAt: (row.completed_at as string | null) ?? null,
    closeReason: (row.close_reason as LocationRequestCloseReason | null) ?? null,
    hadFreshPresence: Boolean(row.had_fresh_presence),
    readAttempted: Boolean(row.read_attempted),
    locationPointId: (row.location_point_id as string | null) ?? null,
  };
}

export async function fetchOpenLocationRequest(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<LocationRequestRow | null> {
  const { data, error } = await supabase
    .from("location_requests")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .eq("status", LOCATION_REQUEST_STATUS.open)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLocationRequestRow(data as Record<string, unknown>) : null;
}

export async function fetchLatestLocationRequest(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<LocationRequestRow | null> {
  const { data, error } = await supabase
    .from("location_requests")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLocationRequestRow(data as Record<string, unknown>) : null;
}

export async function insertLocationRequest(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    careRecipientId: string;
    requestedBy: string;
    requestedAt: string;
    expiresAt: string;
  },
): Promise<LocationRequestRow> {
  const { data, error } = await supabase
    .from("location_requests")
    .insert({
      account_id: input.accountId,
      care_recipient_id: input.careRecipientId,
      requested_by: input.requestedBy,
      status: LOCATION_REQUEST_STATUS.open,
      requested_at: input.requestedAt,
      expires_at: input.expiresAt,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapLocationRequestRow(data as Record<string, unknown>);
}

export async function closeLocationRequest(
  supabase: SupabaseClient,
  requestId: string,
  input: {
    closeReason: LocationRequestCloseReason;
    completedAt: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("location_requests")
    .update({
      status: LOCATION_REQUEST_STATUS.closed,
      close_reason: input.closeReason,
      completed_at: input.completedAt,
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}

export async function fulfillLocationRequest(
  supabase: SupabaseClient,
  requestId: string,
  input: {
    locationPointId: string;
    completedAt: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("location_requests")
    .update({
      status: LOCATION_REQUEST_STATUS.fulfilled,
      location_point_id: input.locationPointId,
      completed_at: input.completedAt,
      close_reason: null,
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}

export async function markLocationRequestFreshPresence(
  supabase: SupabaseClient,
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from("location_requests")
    .update({ had_fresh_presence: true })
    .eq("id", requestId)
    .eq("status", LOCATION_REQUEST_STATUS.open);

  if (error) throw new Error(error.message);
}

export async function markLocationRequestReadAttempted(
  supabase: SupabaseClient,
  requestId: string,
  input: { completedAt: string },
): Promise<void> {
  const { error } = await supabase
    .from("location_requests")
    .update({
      read_attempted: true,
      status: LOCATION_REQUEST_STATUS.closed,
      close_reason: LOCATION_REQUEST_CLOSE_REASON.gpsFailed,
      completed_at: input.completedAt,
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}

export async function fetchActiveDeviceLastSeen(
  supabase: SupabaseClient,
  accountId: string,
  careRecipientId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("care_recipient_device_summaries")
    .select("last_seen_at")
    .eq("account_id", accountId)
    .eq("care_recipient_id", careRecipientId)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.last_seen_at as string | null) ?? null;
}
