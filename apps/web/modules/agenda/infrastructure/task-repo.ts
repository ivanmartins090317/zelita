import type { SupabaseClient } from "@supabase/supabase-js";

import type { TaskStatus, TaskType } from "../domain/task-types";

export interface TaskSnapshot {
  id: string;
  title: string;
  taskType: TaskType;
  dueDate: string | null;
  assigneeProfileId: string | null;
  appointmentId: string | null;
  status: TaskStatus;
  completedAt: string | null;
}

interface TaskRow {
  id: string;
  title: string;
  task_type: TaskType;
  due_date: string | null;
  assignee_profile_id: string | null;
  appointment_id: string | null;
  status: TaskStatus;
  completed_at: string | null;
}

function mapRow(row: TaskRow): TaskSnapshot {
  return {
    id: row.id,
    title: row.title,
    taskType: row.task_type,
    dueDate: row.due_date,
    assigneeProfileId: row.assignee_profile_id,
    appointmentId: row.appointment_id,
    status: row.status,
    completedAt: row.completed_at,
  };
}

export async function fetchFamilyTasks(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<TaskSnapshot[]> {
  const { data, error } = await supabase
    .from("family_tasks")
    .select(
      "id, title, task_type, due_date, assignee_profile_id, appointment_id, status, completed_at",
    )
    .eq("care_recipient_id", careRecipientId)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(
      "Não foi possível carregar as tarefas agora. Tente recarregar a página.",
    );
  }

  return (data as TaskRow[] | null)?.map(mapRow) ?? [];
}

export async function fetchOpenTasksForNeeds(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<TaskSnapshot[]> {
  const { data, error } = await supabase
    .from("family_tasks")
    .select(
      "id, title, task_type, due_date, assignee_profile_id, appointment_id, status, completed_at",
    )
    .eq("care_recipient_id", careRecipientId)
    .eq("status", "open");

  if (error) {
    throw new Error(
      "Não foi possível carregar as tarefas abertas.",
    );
  }

  return (data as TaskRow[] | null)?.map(mapRow) ?? [];
}

export async function fetchTaskById(
  supabase: SupabaseClient,
  taskId: string,
  careRecipientId: string,
): Promise<TaskSnapshot | null> {
  const { data, error } = await supabase
    .from("family_tasks")
    .select(
      "id, title, task_type, due_date, assignee_profile_id, appointment_id, status, completed_at",
    )
    .eq("id", taskId)
    .eq("care_recipient_id", careRecipientId)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a tarefa.");
  }

  return data ? mapRow(data as TaskRow) : null;
}

export interface InsertTaskInput {
  careRecipientId: string;
  title: string;
  taskType: TaskType;
  dueDate: string | null;
  assigneeProfileId: string | null;
  appointmentId: string | null;
  createdBy: string;
}

export async function insertTask(
  supabase: SupabaseClient,
  input: InsertTaskInput,
): Promise<string> {
  const { data, error } = await supabase
    .from("family_tasks")
    .insert({
      care_recipient_id: input.careRecipientId,
      title: input.title,
      task_type: input.taskType,
      due_date: input.dueDate,
      assignee_profile_id: input.assigneeProfileId,
      appointment_id: input.appointmentId,
      created_by: input.createdBy,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Não foi possível salvar a tarefa. Tente de novo.");
  }

  return data.id as string;
}

export async function updateTaskRow(
  supabase: SupabaseClient,
  taskId: string,
  careRecipientId: string,
  patch: Partial<{
    title: string;
    task_type: TaskType;
    due_date: string | null;
    assignee_profile_id: string | null;
    appointment_id: string | null;
  }>,
): Promise<void> {
  const { error } = await supabase
    .from("family_tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("care_recipient_id", careRecipientId);

  if (error) {
    throw new Error("Não foi possível atualizar a tarefa. Tente de novo.");
  }
}

export async function completeTaskRow(
  supabase: SupabaseClient,
  taskId: string,
  careRecipientId: string,
  completedBy: string,
): Promise<void> {
  const { error } = await supabase
    .from("family_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completed_by: completedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("care_recipient_id", careRecipientId)
    .eq("status", "open");

  if (error) {
    throw new Error("Não foi possível concluir a tarefa. Tente de novo.");
  }
}

export async function reopenTaskRow(
  supabase: SupabaseClient,
  taskId: string,
  careRecipientId: string,
): Promise<void> {
  const { error } = await supabase
    .from("family_tasks")
    .update({
      status: "open",
      completed_at: null,
      completed_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("care_recipient_id", careRecipientId)
    .eq("status", "completed");

  if (error) {
    throw new Error("Não foi possível reabrir a tarefa. Tente de novo.");
  }
}
