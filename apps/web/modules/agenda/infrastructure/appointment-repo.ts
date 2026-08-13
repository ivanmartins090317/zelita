import type { SupabaseClient } from "@supabase/supabase-js";

import type { AppointmentStatus, AppointmentType } from "../domain/appointment-types";

export interface AppointmentSnapshot {
  id: string;
  title: string;
  specialty: string | null;
  appointmentType: AppointmentType;
  startsAt: string;
  location: string | null;
  companionProfileId: string | null;
  preparationNote: string | null;
  status: AppointmentStatus;
}

interface AppointmentRow {
  id: string;
  title: string;
  specialty: string | null;
  appointment_type: AppointmentType;
  starts_at: string;
  location: string | null;
  companion_profile_id: string | null;
  preparation_note: string | null;
  status: AppointmentStatus;
}

function mapRow(row: AppointmentRow): AppointmentSnapshot {
  return {
    id: row.id,
    title: row.title,
    specialty: row.specialty,
    appointmentType: row.appointment_type,
    startsAt: row.starts_at,
    location: row.location,
    companionProfileId: row.companion_profile_id,
    preparationNote: row.preparation_note,
    status: row.status,
  };
}

export async function fetchAppointmentsForWeek(
  supabase: SupabaseClient,
  careRecipientId: string,
  weekStartIso: string,
  weekEndIso: string,
): Promise<AppointmentSnapshot[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, title, specialty, appointment_type, starts_at, location, companion_profile_id, preparation_note, status",
    )
    .eq("care_recipient_id", careRecipientId)
    .gte("starts_at", weekStartIso)
    .lte("starts_at", weekEndIso)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(
      "Não foi possível carregar as consultas agora. Tente recarregar a página.",
    );
  }

  return (data as AppointmentRow[] | null)?.map(mapRow) ?? [];
}

export async function fetchUpcomingAppointments(
  supabase: SupabaseClient,
  careRecipientId: string,
  nowIso: string,
  limit = 20,
): Promise<AppointmentSnapshot[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, title, specialty, appointment_type, starts_at, location, companion_profile_id, preparation_note, status",
    )
    .eq("care_recipient_id", careRecipientId)
    .eq("status", "scheduled")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(
      "Não foi possível carregar as consultas agora. Tente recarregar a página.",
    );
  }

  return (data as AppointmentRow[] | null)?.map(mapRow) ?? [];
}

export async function fetchTodayAppointments(
  supabase: SupabaseClient,
  careRecipientId: string,
  dayStartIso: string,
  dayEndIso: string,
): Promise<AppointmentSnapshot[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, title, specialty, appointment_type, starts_at, location, companion_profile_id, preparation_note, status",
    )
    .eq("care_recipient_id", careRecipientId)
    .eq("status", "scheduled")
    .gte("starts_at", dayStartIso)
    .lte("starts_at", dayEndIso)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(
      "Não foi possível carregar as consultas de hoje. Tente recarregar a página.",
    );
  }

  return (data as AppointmentRow[] | null)?.map(mapRow) ?? [];
}

export async function fetchAppointmentById(
  supabase: SupabaseClient,
  appointmentId: string,
  careRecipientId: string,
): Promise<AppointmentSnapshot | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, title, specialty, appointment_type, starts_at, location, companion_profile_id, preparation_note, status",
    )
    .eq("id", appointmentId)
    .eq("care_recipient_id", careRecipientId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a consulta.");
  }

  return data ? mapRow(data as AppointmentRow) : null;
}

export interface InsertAppointmentInput {
  careRecipientId: string;
  title: string;
  specialty: string | null;
  appointmentType: AppointmentType;
  startsAt: string;
  location: string | null;
  companionProfileId: string | null;
  preparationNote: string | null;
  createdBy: string;
}

export async function insertAppointment(
  supabase: SupabaseClient,
  input: InsertAppointmentInput,
): Promise<string> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      care_recipient_id: input.careRecipientId,
      title: input.title,
      specialty: input.specialty,
      appointment_type: input.appointmentType,
      starts_at: input.startsAt,
      location: input.location,
      companion_profile_id: input.companionProfileId,
      preparation_note: input.preparationNote,
      created_by: input.createdBy,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Não foi possível salvar a consulta. Tente de novo.");
  }

  return data.id as string;
}

export async function updateAppointmentRow(
  supabase: SupabaseClient,
  appointmentId: string,
  careRecipientId: string,
  patch: Partial<{
    title: string;
    specialty: string | null;
    appointment_type: AppointmentType;
    starts_at: string;
    location: string | null;
    companion_profile_id: string | null;
    preparation_note: string | null;
  }>,
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", appointmentId)
    .eq("care_recipient_id", careRecipientId);

  if (error) {
    throw new Error("Não foi possível atualizar a consulta. Tente de novo.");
  }
}

export async function cancelAppointmentRow(
  supabase: SupabaseClient,
  appointmentId: string,
  careRecipientId: string,
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("care_recipient_id", careRecipientId);

  if (error) {
    throw new Error("Não foi possível cancelar a consulta. Tente de novo.");
  }
}

export async function isActiveMemberProfile(
  supabase: SupabaseClient,
  accountId: string,
  profileId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("account_members")
    .select("*", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("profile_id", profileId)
    .eq("status", "active");

  if (error) return false;
  return (count ?? 0) > 0;
}
