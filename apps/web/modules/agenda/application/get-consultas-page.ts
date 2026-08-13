import { familyContent } from "@/content/family";
import {
  getFamilyContext,
  requireRoutineViewer,
} from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { DEFAULT_CARE_TIMEZONE } from "@/modules/medications/domain/hoje-timeline";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canManageAgenda } from "../domain/can-manage-agenda";
import {
  formatAppointmentDateTime,
  formatAssigneeLine,
  formatCompanionTag,
  formatTaskDueLine,
  formatWeekTitle,
} from "../domain/agenda-labels";
import {
  formatAppointmentTitle,
  APPOINTMENT_TYPE_VISUALS,
} from "../domain/appointment-types";
import {
  TASK_TYPE_VISUALS,
  type TaskType,
} from "../domain/task-types";
import {
  buildWeekGrid,
  getTodayDateKey,
  parseWeekParam,
} from "../domain/week-grid";
import {
  fetchAppointmentsForWeek,
  fetchAppointmentById,
  fetchUpcomingAppointments,
} from "../infrastructure/appointment-repo";
import { fetchFamilyTasks, fetchTaskById } from "../infrastructure/task-repo";
import { getMedicationInputsForGrid } from "./get-today-agenda-snapshot";

export interface AgendaMemberOption {
  profileId: string;
  displayName: string;
}

export interface UpcomingAppointmentItem {
  id: string;
  icon: string;
  iconBgClass: string;
  title: string;
  subtitle: string;
  companionTag: string | null;
  preparationTag: string | null;
}

export interface FamilyTaskItem {
  id: string;
  icon: string;
  iconBgClass: string;
  title: string;
  subtitle: string;
  status: "open" | "completed";
}

export interface ConsultasPageViewModel {
  weekGrid: ReturnType<typeof buildWeekGrid>;
  weekTitle: string;
  weekStartDateKey: string;
  upcomingAppointments: UpcomingAppointmentItem[];
  openTasks: FamilyTaskItem[];
  completedTasks: FamilyTaskItem[];
  members: AgendaMemberOption[];
  futureAppointmentsForLink: Array<{ id: string; label: string }>;
  canManage: boolean;
  isPaused: boolean;
  careRecipientId: string;
  openModal: "consulta" | "tarefa" | null;
  editingAppointment: {
    id: string;
    title: string;
    specialty: string | null;
    appointmentType: string;
    startsAtLocal: string;
    location: string | null;
    companionProfileId: string | null;
    preparationNote: string | null;
  } | null;
  editingTask: {
    id: string;
    title: string;
    taskType: string;
    dueDate: string | null;
    assigneeProfileId: string | null;
    appointmentId: string | null;
  } | null;
}

export type ConsultasPageResult =
  | { ok: true; data: ConsultasPageViewModel }
  | { ok: false; message: string };

function weekBoundsIso(weekStartDateKey: string) {
  const [y, m, d] = weekStartDateKey.split("-").map(Number);
  const startIso = `${weekStartDateKey}T00:00:00.000-03:00`;
  const endDate = new Date(Date.UTC(y, m - 1, d + 6, 23, 59, 59, 999));
  const endKey = endDate.toISOString().slice(0, 10);
  const endIso = `${endKey}T23:59:59.999-03:00`;
  return { startIso, endIso };
}

export async function getConsultasPage(input: {
  semana?: string | null;
  modal?: string | null;
  editar?: string | null;
  editarTarefa?: string | null;
  now?: Date;
}): Promise<ConsultasPageResult> {
  try {
    await requireRoutineViewer();
    const shell = await getShellContext();
    if (!shell) {
      return { ok: false, message: "Cadastro incompleto." };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, message: "Cadastro incompleto." };
    }

    const timeZone = DEFAULT_CARE_TIMEZONE;
    const now = input.now ?? new Date();
    const copy = familyContent.consultas;
    const supabase = await createSupabaseServerClient();

    const weekStartDateKey = parseWeekParam(input.semana, now, timeZone);
    const todayDateKey = getTodayDateKey(now, timeZone);
    const { startIso, endIso } = weekBoundsIso(weekStartDateKey);

    const [medications, weekAppointments, upcoming, tasks, memberRows] =
      await Promise.all([
        getMedicationInputsForGrid(ctx.careRecipientId, now, timeZone),
        fetchAppointmentsForWeek(
          supabase,
          ctx.careRecipientId,
          startIso,
          endIso,
        ),
        fetchUpcomingAppointments(supabase, ctx.careRecipientId, now.toISOString()),
        fetchFamilyTasks(supabase, ctx.careRecipientId),
        supabase
          .from("account_members")
          .select("profile_id, profiles(full_name)")
          .eq("account_id", ctx.accountId)
          .eq("status", "active"),
      ]);

    const memberNames = new Map<string, string>();
    const members: AgendaMemberOption[] = [];
    for (const row of memberRows.data ?? []) {
      const profileId = row.profile_id as string;
      const profile = Array.isArray(row.profiles)
        ? row.profiles[0]
        : row.profiles;
      const name =
        (profile as { full_name?: string })?.full_name ?? "Participante";
      memberNames.set(profileId, name);
      members.push({ profileId, displayName: name });
    }

    const weekGrid = buildWeekGrid({
      weekStartDateKey,
      todayDateKey,
      timeZone,
      medications,
      appointments: weekAppointments.map((a) => ({
        title: a.title,
        startsAt: a.startsAt,
        status: a.status,
      })),
    });

    const weekTitle = formatWeekTitle({
      startDay: weekGrid.titleInterval.startDay,
      endDay: weekGrid.titleInterval.endDay,
      monthLabel: weekGrid.titleInterval.monthLabel,
      template: copy.weekGrid.titleTemplate,
    });

    const upcomingAppointments: UpcomingAppointmentItem[] = upcoming.map(
      (appt) => {
        const visual = APPOINTMENT_TYPE_VISUALS[appt.appointmentType];
        const companionName = appt.companionProfileId
          ? memberNames.get(appt.companionProfileId) ?? null
          : null;
        const subtitleParts: string[] = [
          formatAppointmentDateTime({
            startsAt: appt.startsAt,
            now,
            timeZone,
            todayLabel: copy.list.todayLabel,
          }),
        ];
        if (appt.location) subtitleParts.push(appt.location);

        return {
          id: appt.id,
          icon: visual.icon,
          iconBgClass: visual.bgClass,
          title: formatAppointmentTitle(appt.title, appt.specialty),
          subtitle: subtitleParts.join(" · "),
          companionTag: formatCompanionTag(companionName, copy.list.companionTag),
          preparationTag: appt.preparationNote?.trim()
            ? appt.preparationNote.trim()
            : null,
        };
      },
    );

    function mapTask(task: {
      id: string;
      title: string;
      taskType: TaskType;
      dueDate: string | null;
      assigneeProfileId: string | null;
      status: "open" | "completed";
    }): FamilyTaskItem {
      const visual = TASK_TYPE_VISUALS[task.taskType];
      const assigneeLine = formatAssigneeLine({
        assigneeName: task.assigneeProfileId
          ? memberNames.get(task.assigneeProfileId) ?? null
          : null,
        currentUserId: ctx.userId,
        assigneeProfileId: task.assigneeProfileId,
        assignedToYou: copy.tasks.assignedToYou,
        assignedToTemplate: copy.tasks.assignedToTemplate,
        anyoneLabel: copy.tasks.anyoneLabel,
      });
      return {
        id: task.id,
        icon: visual.icon,
        iconBgClass: visual.bgClass,
        title: task.title,
        subtitle: formatTaskDueLine({
          dueDate: task.dueDate,
          assigneeLine,
          untilTemplate: copy.tasks.untilTemplate,
          separator: copy.tasks.metaSeparator,
        }),
        status: task.status,
      };
    }

    const openTasks = tasks
      .filter((t) => t.status === "open")
      .map(mapTask);
    const completedTasks = tasks
      .filter((t) => t.status === "completed")
      .map(mapTask);

    const canManage = canManageAgenda(ctx.role);
    let openModal: "consulta" | "tarefa" | null = null;
    if (canManage) {
      if (input.modal === "consulta") openModal = "consulta";
      if (input.modal === "tarefa") openModal = "tarefa";
    }

    const futureAppointmentsForLink = upcoming.map((a) => ({
      id: a.id,
      label: formatAppointmentTitle(a.title, a.specialty),
    }));

    function toDatetimeLocal(iso: string): string {
      const d = new Date(iso);
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(d);
      const read = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "00";
      return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
    }

    let editingAppointment: ConsultasPageViewModel["editingAppointment"] = null;
    if (canManage && input.editar) {
      const raw = await fetchAppointmentById(
        supabase,
        input.editar,
        ctx.careRecipientId,
      );
      if (raw && raw.status === "scheduled") {
        editingAppointment = {
          id: raw.id,
          title: raw.title,
          specialty: raw.specialty,
          appointmentType: raw.appointmentType,
          startsAtLocal: toDatetimeLocal(raw.startsAt),
          location: raw.location,
          companionProfileId: raw.companionProfileId,
          preparationNote: raw.preparationNote,
        };
        openModal = "consulta";
      }
    }

    let editingTask: ConsultasPageViewModel["editingTask"] = null;
    if (canManage && input.editarTarefa) {
      const raw = await fetchTaskById(
        supabase,
        input.editarTarefa,
        ctx.careRecipientId,
      );
      if (raw && raw.status === "open") {
        editingTask = {
          id: raw.id,
          title: raw.title,
          taskType: raw.taskType,
          dueDate: raw.dueDate,
          assigneeProfileId: raw.assigneeProfileId,
          appointmentId: raw.appointmentId,
        };
        openModal = "tarefa";
      }
    }

    return {
      ok: true,
      data: {
        weekGrid,
        weekTitle,
        weekStartDateKey,
        upcomingAppointments,
        openTasks,
        completedTasks,
        members,
        futureAppointmentsForLink,
        canManage,
        isPaused: isAccountPaused(ctx.accountStatus ?? "active"),
        careRecipientId: ctx.careRecipientId,
        openModal,
        editingAppointment,
        editingTask,
      },
    };
  } catch {
    return {
      ok: false,
      message: familyContent.consultas.loadError,
    };
  }
}
