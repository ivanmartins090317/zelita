"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { familyContent, familyRoutes } from "@/content/family";
import {
  getFamilyContext,
  requireRoutineViewer,
} from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canCompleteTask, canManageAgenda } from "../domain/can-manage-agenda";
import { isAppointmentType } from "../domain/appointment-types";
import { isTaskType } from "../domain/task-types";
import {
  cancelAppointmentRow,
  fetchAppointmentById,
  insertAppointment,
  isActiveMemberProfile,
  updateAppointmentRow,
} from "../infrastructure/appointment-repo";
import {
  completeTaskRow,
  fetchTaskById,
  insertTask,
  reopenTaskRow,
  updateTaskRow,
} from "../infrastructure/task-repo";

export interface AgendaActionResult {
  ok: boolean;
  message?: string;
}

async function requireAgendaManager() {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.role || !canManageAgenda(ctx.role)) {
    throw new Error(familyContent.consultas.errors.noPermission);
  }
  if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
    throw new Error(familyContent.consultas.errors.paused);
  }
  if (!ctx.careRecipientId) {
    throw new Error("Cadastro incompleto.");
  }
  return ctx;
}

async function validateCompanion(
  accountId: string,
  profileId: string | null,
): Promise<string | null> {
  if (!profileId) return null;
  const supabase = await createSupabaseServerClient();
  const active = await isActiveMemberProfile(supabase, accountId, profileId);
  if (!active) {
    throw new Error(familyContent.consultas.errors.invalidCompanion);
  }
  return profileId;
}

const appointmentSchema = z.object({
  careRecipientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  title: z.string().min(2, familyContent.consultas.errors.titleRequired),
  specialty: z.string().optional(),
  appointmentType: z.string().refine(isAppointmentType),
  startsAt: z.string().min(1, familyContent.consultas.errors.datetimeRequired),
  location: z.string().optional(),
  companionProfileId: z.string().uuid().optional().or(z.literal("")),
  preparationNote: z.string().optional(),
});

const taskSchema = z.object({
  careRecipientId: z.string().uuid(),
  taskId: z.string().uuid().optional(),
  title: z.string().min(2, familyContent.consultas.errors.taskTitleRequired),
  taskType: z.string().refine(isTaskType),
  dueDate: z.string().optional(),
  assigneeProfileId: z.string().uuid().optional().or(z.literal("")),
  appointmentId: z.string().uuid().optional().or(z.literal("")),
});

function revalidateAgenda() {
  revalidatePath(familyRoutes.consultas);
  revalidatePath(familyRoutes.hoje);
}

export async function saveAppointmentAction(
  _prev: AgendaActionResult,
  formData: FormData,
): Promise<AgendaActionResult> {
  try {
    const ctx = await requireAgendaManager();
    const parsed = appointmentSchema.safeParse({
      careRecipientId: formData.get("careRecipientId"),
      appointmentId: formData.get("appointmentId") || undefined,
      title: formData.get("title"),
      specialty: formData.get("specialty") || undefined,
      appointmentType: formData.get("appointmentType"),
      startsAt: formData.get("startsAt"),
      location: formData.get("location") || undefined,
      companionProfileId: formData.get("companionProfileId") || "",
      preparationNote: formData.get("preparationNote") || undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message };
    }

    if (parsed.data.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: familyContent.consultas.errors.noPermission };
    }

    const startsAt = new Date(parsed.data.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      return { ok: false, message: familyContent.consultas.errors.datetimeInvalid };
    }

    const companionProfileId = await validateCompanion(
      ctx.accountId!,
      parsed.data.companionProfileId || null,
    );

    const supabase = await createSupabaseServerClient();

    if (parsed.data.appointmentId) {
      await updateAppointmentRow(
        supabase,
        parsed.data.appointmentId,
        ctx.careRecipientId!,
        {
          title: parsed.data.title.trim(),
          specialty: parsed.data.specialty?.trim() || null,
          appointment_type: parsed.data.appointmentType,
          starts_at: startsAt.toISOString(),
          location: parsed.data.location?.trim() || null,
          companion_profile_id: companionProfileId,
          preparation_note: parsed.data.preparationNote?.trim() || null,
        },
      );
    } else {
      await insertAppointment(supabase, {
        careRecipientId: ctx.careRecipientId!,
        title: parsed.data.title.trim(),
        specialty: parsed.data.specialty?.trim() || null,
        appointmentType: parsed.data.appointmentType,
        startsAt: startsAt.toISOString(),
        location: parsed.data.location?.trim() || null,
        companionProfileId,
        preparationNote: parsed.data.preparationNote?.trim() || null,
        createdBy: ctx.userId,
      });
    }

    revalidateAgenda();
    return { ok: true, message: familyContent.consultas.feedback.appointmentSaved };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.consultas.errors.generic,
    };
  }
}

export async function cancelAppointmentAction(
  _prev: AgendaActionResult,
  formData: FormData,
): Promise<AgendaActionResult> {
  try {
    const ctx = await requireAgendaManager();
    const appointmentId = String(formData.get("appointmentId") ?? "");
    if (!appointmentId) {
      return { ok: false, message: familyContent.consultas.errors.generic };
    }

    const supabase = await createSupabaseServerClient();
    await cancelAppointmentRow(
      supabase,
      appointmentId,
      ctx.careRecipientId!,
    );
    revalidateAgenda();
    return { ok: true, message: familyContent.consultas.feedback.appointmentCancelled };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.consultas.errors.generic,
    };
  }
}

async function validateLinkedAppointment(
  appointmentId: string | null,
  careRecipientId: string,
): Promise<string | null> {
  if (!appointmentId) return null;
  const supabase = await createSupabaseServerClient();
  const appt = await fetchAppointmentById(
    supabase,
    appointmentId,
    careRecipientId,
  );
  if (!appt || appt.status !== "scheduled") {
    throw new Error(familyContent.consultas.errors.invalidLinkedAppointment);
  }
  return appointmentId;
}

export async function saveTaskAction(
  _prev: AgendaActionResult,
  formData: FormData,
): Promise<AgendaActionResult> {
  try {
    const ctx = await requireAgendaManager();
    const parsed = taskSchema.safeParse({
      careRecipientId: formData.get("careRecipientId"),
      taskId: formData.get("taskId") || undefined,
      title: formData.get("title"),
      taskType: formData.get("taskType"),
      dueDate: formData.get("dueDate") || undefined,
      assigneeProfileId: formData.get("assigneeProfileId") || "",
      appointmentId: formData.get("appointmentId") || "",
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message };
    }

    if (parsed.data.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: familyContent.consultas.errors.noPermission };
    }

    const assigneeProfileId = await validateCompanion(
      ctx.accountId!,
      parsed.data.assigneeProfileId || null,
    );
    const appointmentId = await validateLinkedAppointment(
      parsed.data.appointmentId || null,
      ctx.careRecipientId!,
    );

    const supabase = await createSupabaseServerClient();

    if (parsed.data.taskId) {
      await updateTaskRow(supabase, parsed.data.taskId, ctx.careRecipientId!, {
        title: parsed.data.title.trim(),
        task_type: parsed.data.taskType,
        due_date: parsed.data.dueDate || null,
        assignee_profile_id: assigneeProfileId,
        appointment_id: appointmentId,
      });
    } else {
      await insertTask(supabase, {
        careRecipientId: ctx.careRecipientId!,
        title: parsed.data.title.trim(),
        taskType: parsed.data.taskType,
        dueDate: parsed.data.dueDate || null,
        assigneeProfileId,
        appointmentId,
        createdBy: ctx.userId,
      });
    }

    revalidateAgenda();
    return { ok: true, message: familyContent.consultas.feedback.taskSaved };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.consultas.errors.generic,
    };
  }
}

export async function completeTaskAction(
  _prev: AgendaActionResult,
  formData: FormData,
): Promise<AgendaActionResult> {
  try {
    const ctx = await requireRoutineViewer();
    if (!ctx.careRecipientId || !ctx.role) {
      return { ok: false, message: familyContent.consultas.errors.noPermission };
    }

    const taskId = String(formData.get("taskId") ?? "");
    const supabase = await createSupabaseServerClient();
    const task = await fetchTaskById(supabase, taskId, ctx.careRecipientId);

    if (!task || task.status !== "open") {
      return { ok: false, message: familyContent.consultas.errors.generic };
    }

    if (
      !canCompleteTask({
        role: ctx.role,
        userId: ctx.userId,
        assigneeProfileId: task.assigneeProfileId,
      })
    ) {
      return { ok: false, message: familyContent.consultas.errors.noPermission };
    }

    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: familyContent.consultas.errors.paused };
    }

    await completeTaskRow(
      supabase,
      taskId,
      ctx.careRecipientId,
      ctx.userId,
    );
    revalidateAgenda();
    return { ok: true, message: familyContent.consultas.feedback.taskCompleted };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.consultas.errors.generic,
    };
  }
}

export async function reopenTaskAction(
  _prev: AgendaActionResult,
  formData: FormData,
): Promise<AgendaActionResult> {
  try {
    const ctx = await requireAgendaManager();
    const taskId = String(formData.get("taskId") ?? "");
    const supabase = await createSupabaseServerClient();
    await reopenTaskRow(supabase, taskId, ctx.careRecipientId!);
    revalidateAgenda();
    return { ok: true, message: familyContent.consultas.feedback.taskReopened };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.consultas.errors.generic,
    };
  }
}
