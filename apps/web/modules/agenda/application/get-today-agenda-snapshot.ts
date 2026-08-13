import { getMedicationSchedulesForAgenda } from "@/modules/medications";
import { DEFAULT_CARE_TIMEZONE, getDayBounds } from "@/modules/medications/domain/hoje-timeline";
import type { TimelineItem } from "@/modules/medications/domain/hoje-timeline";
import { familyContent, familyRoutes } from "@/content/family";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { formatAppointmentTitle } from "../domain/appointment-types";
import { formatCompanionTag } from "../domain/agenda-labels";
import {
  buildNeedsAttentionItems,
  type NeedsPriorityItem,
} from "../domain/needs-priority";
import { fetchTodayAppointments } from "../infrastructure/appointment-repo";
import { fetchOpenTasksForNeeds } from "../infrastructure/task-repo";

export interface TodayAgendaSnapshot {
  timelineItems: TimelineItem[];
  needsItems: NeedsPriorityItem[];
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function formatTimeFromIso(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export async function getTodayAgendaSnapshot(input: {
  careRecipientId: string;
  accountId: string;
  currentUserId: string;
  now?: Date;
  timeZone?: string;
  companionNames?: Map<string, string>;
  refillNeedsItems?: NeedsPriorityItem[];
}): Promise<TodayAgendaSnapshot> {
  const now = input.now ?? new Date();
  const timeZone = input.timeZone ?? DEFAULT_CARE_TIMEZONE;
  const copy = familyContent.consultas;
  const supabase = await createSupabaseServerClient();

  const { startIso, endIso } = getDayBounds(now, timeZone);
  const appointments = await fetchTodayAppointments(
    supabase,
    input.careRecipientId,
    startIso,
    endIso,
  );

  const zonedNow = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const nowHour = Number(
    zonedNow.find((p) => p.type === "hour")?.value ?? 0,
  );
  const nowMinute = Number(
    zonedNow.find((p) => p.type === "minute")?.value ?? 0,
  );
  const nowMinutes = nowHour * 60 + nowMinute;

  const timelineItems: TimelineItem[] = appointments.map((appt) => {
    const timeLabel = formatTimeFromIso(appt.startsAt, timeZone);
    const minutes = parseTimeToMinutes(timeLabel);
    const companionName = appt.companionProfileId
      ? input.companionNames?.get(appt.companionProfileId) ?? null
      : null;
    const title = formatAppointmentTitle(appt.title, appt.specialty);
    const subtitleParts: string[] = [];
    const companionLine = formatCompanionTag(
      companionName,
      copy.list.companionTag,
    );
    if (companionLine) subtitleParts.push(companionLine);
    if (appt.location) subtitleParts.push(appt.location);

    return {
      sortKey: minutes,
      timeLabel: `${timeLabel} · previsto`,
      title,
      subtitle: subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined,
      variant: minutes > nowMinutes ? "muted" : "muted",
    };
  });

  const openTasks = await fetchOpenTasksForNeeds(
    supabase,
    input.careRecipientId,
  );

  const assigneeProfiles = await supabase
    .from("account_members")
    .select("profile_id, profiles(full_name)")
    .eq("account_id", input.accountId)
    .eq("status", "active");

  const assigneeNames = new Map<string, string>();
  for (const row of assigneeProfiles.data ?? []) {
    const profileId = row.profile_id as string;
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    assigneeNames.set(
      profileId,
      (profile as { full_name?: string })?.full_name ?? "Alguém",
    );
  }

  const needsItems = buildNeedsAttentionItems({
    todayDateKey: getDayBounds(now, timeZone).dateKey,
    currentUserId: input.currentUserId,
    refillItems: input.refillNeedsItems ?? [],
    tasks: openTasks.map((task) => ({
      id: task.id,
      title: task.title,
      taskType: task.taskType,
      dueDate: task.dueDate,
      assigneeProfileId: task.assigneeProfileId,
      assigneeName: task.assigneeProfileId
        ? assigneeNames.get(task.assigneeProfileId) ?? null
        : null,
    })),
    copy: {
      assignedToYou: copy.tasks.assignedToYou,
      assignedToTemplate: copy.tasks.assignedToTemplate,
      untilTemplate: copy.tasks.untilTemplate,
      separator: copy.tasks.metaSeparator,
      consultasHref: familyRoutes.consultas,
    },
  });

  return { timelineItems, needsItems };
}

export async function getMedicationInputsForGrid(
  careRecipientId: string,
  now?: Date,
  timeZone?: string,
) {
  const tz = timeZone ?? DEFAULT_CARE_TIMEZONE;
  const medications = await getMedicationSchedulesForAgenda({
    careRecipientId,
    now: now ?? new Date(),
    timeZone: tz,
  });
  return medications.map((med) => ({
    name: med.medicationName,
    times: med.times,
  }));
}
