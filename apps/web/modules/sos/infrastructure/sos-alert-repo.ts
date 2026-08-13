import type { SupabaseClient } from "@supabase/supabase-js";

import {
  parseSosAlertStatus,
  type SosAlertStatus,
} from "../domain/sos-alert-status";

export interface SosAlertRow {
  id: string;
  careRecipientId: string;
  status: SosAlertStatus;
  triggeredAt: string;
  triggerSource: string;
  locationText: string | null;
  locationAccuracyM: number | null;
  locationRecordedAt: string | null;
  safeZoneName: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNote: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

const HISTORY_LIMIT = 50;

function mapSosAlertRow(row: Record<string, unknown>): SosAlertRow {
  const status = parseSosAlertStatus(row.status);
  if (!status) {
    throw new Error("Status de alerta SOS inválido.");
  }

  return {
    id: row.id as string,
    careRecipientId: row.care_recipient_id as string,
    status,
    triggeredAt: row.triggered_at as string,
    triggerSource: row.trigger_source as string,
    locationText: (row.location_text as string | null) ?? null,
    locationAccuracyM: (row.location_accuracy_m as number | null) ?? null,
    locationRecordedAt: (row.location_recorded_at as string | null) ?? null,
    safeZoneName: (row.safe_zone_name as string | null) ?? null,
    resolvedAt: (row.resolved_at as string | null) ?? null,
    resolvedBy: (row.resolved_by as string | null) ?? null,
    resolutionNote: (row.resolution_note as string | null) ?? null,
    cancelledAt: (row.cancelled_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function fetchSosAlertsForCareRecipient(
  supabase: SupabaseClient,
  careRecipientId: string,
  limit = HISTORY_LIMIT,
): Promise<SosAlertRow[]> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("triggered_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapSosAlertRow(row as Record<string, unknown>));
}

export async function fetchSosAlertById(
  supabase: SupabaseClient,
  alertId: string,
): Promise<SosAlertRow | null> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .eq("id", alertId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapSosAlertRow(data as Record<string, unknown>);
}

export async function resolveSosAlertRecord(
  supabase: SupabaseClient,
  input: {
    alertId: string;
    resolvedBy: string;
    resolutionNote: string | null;
    resolvedAt: string;
  },
): Promise<SosAlertRow> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .update({
      status: "resolved",
      resolved_by: input.resolvedBy,
      resolution_note: input.resolutionNote,
      resolved_at: input.resolvedAt,
      updated_at: input.resolvedAt,
    })
    .eq("id", input.alertId)
    .eq("status", "open")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("ALREADY_RESOLVED");
  }

  return mapSosAlertRow(data as Record<string, unknown>);
}

export async function countOpenSosAlerts(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("sos_alerts")
    .select("*", { count: "exact", head: true })
    .eq("care_recipient_id", careRecipientId)
    .eq("status", "open");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
