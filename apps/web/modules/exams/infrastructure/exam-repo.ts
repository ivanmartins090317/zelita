import type { SupabaseClient } from "@supabase/supabase-js";

import type { ExamCategory } from "../domain/exam-categories";

export interface ExamRow {
  id: string;
  careRecipientId: string;
  title: string;
  examDate: string;
  providerName: string | null;
  category: ExamCategory | null;
  notes: string | null;
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamMemberAccessRow {
  examId: string;
  profileId: string;
}

function mapExamRow(row: Record<string, unknown>): ExamRow {
  return {
    id: row.id as string,
    careRecipientId: row.care_recipient_id as string,
    title: row.title as string,
    examDate: row.exam_date as string,
    providerName: (row.provider_name as string | null) ?? null,
    category: (row.category as ExamCategory | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    storagePath: row.storage_path as string,
    originalFileName: row.original_file_name as string,
    mimeType: row.mime_type as string,
    sizeBytes: Number(row.size_bytes),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function fetchExamsForCareRecipient(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<ExamRow[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("care_recipient_id", careRecipientId)
    .order("exam_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapExamRow);
}

export async function fetchExamById(
  supabase: SupabaseClient,
  examId: string,
): Promise<ExamRow | null> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapExamRow(data) : null;
}

export async function fetchExamMemberAccess(
  supabase: SupabaseClient,
  examIds: string[],
): Promise<ExamMemberAccessRow[]> {
  if (examIds.length === 0) return [];

  const { data, error } = await supabase
    .from("exam_member_access")
    .select("exam_id, profile_id")
    .in("exam_id", examIds);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    examId: row.exam_id as string,
    profileId: row.profile_id as string,
  }));
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

export interface CreateExamInput {
  careRecipientId: string;
  title: string;
  examDate: string;
  providerName: string | null;
  category: ExamCategory | null;
  notes: string | null;
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  createdBy: string;
  memberProfileIds: string[];
}

export async function insertExam(
  supabase: SupabaseClient,
  input: CreateExamInput,
): Promise<ExamRow> {
  const { data, error } = await supabase
    .from("exams")
    .insert({
      care_recipient_id: input.careRecipientId,
      title: input.title,
      exam_date: input.examDate,
      provider_name: input.providerName,
      category: input.category,
      notes: input.notes,
      storage_path: input.storagePath,
      original_file_name: input.originalFileName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      created_by: input.createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Falha ao salvar exame.");

  if (input.memberProfileIds.length > 0) {
    const { error: accessError } = await supabase
      .from("exam_member_access")
      .insert(
        input.memberProfileIds.map((profileId) => ({
          exam_id: data.id,
          profile_id: profileId,
        })),
      );
    if (accessError) throw accessError;
  }

  return mapExamRow(data);
}

export interface UpdateExamInput {
  examId: string;
  title: string;
  examDate: string;
  providerName: string | null;
  category: ExamCategory | null;
  notes: string | null;
  memberProfileIds: string[];
}

export async function updateExamRecord(
  supabase: SupabaseClient,
  input: UpdateExamInput,
): Promise<ExamRow> {
  const { data, error } = await supabase
    .from("exams")
    .update({
      title: input.title,
      exam_date: input.examDate,
      provider_name: input.providerName,
      category: input.category,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.examId)
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Falha ao atualizar exame.");

  const { error: deleteError } = await supabase
    .from("exam_member_access")
    .delete()
    .eq("exam_id", input.examId);

  if (deleteError) throw deleteError;

  if (input.memberProfileIds.length > 0) {
    const { error: accessError } = await supabase
      .from("exam_member_access")
      .insert(
        input.memberProfileIds.map((profileId) => ({
          exam_id: input.examId,
          profile_id: profileId,
        })),
      );
    if (accessError) throw accessError;
  }

  return mapExamRow(data);
}

export async function deleteExamRecord(
  supabase: SupabaseClient,
  examId: string,
): Promise<ExamRow> {
  const existing = await fetchExamById(supabase, examId);
  if (!existing) throw new Error("Exame não encontrado.");

  const { error } = await supabase.from("exams").delete().eq("id", examId);
  if (error) throw error;
  return existing;
}

export async function countExamsForCareRecipient(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("exams")
    .select("id", { count: "exact", head: true })
    .eq("care_recipient_id", careRecipientId);

  if (error) throw error;
  return count ?? 0;
}
