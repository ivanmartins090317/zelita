import { cache } from "react";
import * as Sentry from "@sentry/nextjs";

import { elderContent } from "@/content/elder";
import {
  canViewCareRoutine,
  getFamilyContext,
  readCareCircleForElderPreview,
} from "@/modules/accounts";
import { getTodayAgendaSnapshot } from "@/modules/agenda";
import { getHojeMedications } from "@/modules/medications";
import { buildElderCallList, type ElderCallRow } from "@/modules/elder-access/domain/elder-call";
import {
  ELDER_TIME_ZONE,
  buildElderHomeCard,
  buildElderSchedule,
  canOpenElderPreview,
  formatElderGreetingLine,
  formatElderLongDate,
  readZonedClock,
  remindedTimesFromActivity,
  type ElderAppointmentInput,
  type ElderHomeCard,
  type ElderMedicationInput,
  type ElderScheduleItem,
} from "@/modules/elder-access/domain/elder-schedule";
import { readOptionalUserId } from "@/modules/elder-access/application/read-optional-user-id";

export interface ElderReadyPreview {
  kind: "ready";
  greeting: string;
  dateLabel: string;
  homeCard: ElderHomeCard;
  schedule: ElderScheduleItem[];
  calls: ElderCallRow[];
  loadWarning: string | null;
}

export type ElderPreviewResult = { kind: "unlinked" } | ElderReadyPreview;

function logPreviewOpened(accountId: string, careRecipientId: string) {
  Sentry.captureMessage("elder_preview_opened", {
    level: "info",
    tags: { event: "elder_preview_opened" },
    extra: { accountId, careRecipientId },
  });
}

function logPreviewLoadFailed(accountId: string, careRecipientId: string) {
  Sentry.captureMessage("elder_preview_load_failed", {
    level: "error",
    tags: { event: "elder_preview_load_failed" },
    extra: { accountId, careRecipientId },
  });
}

export const getElderPreview = cache(async (): Promise<ElderPreviewResult> => {
  const userId = await readOptionalUserId();
  if (!userId) return { kind: "unlinked" };

  const ctx = await getFamilyContext();
  const canView = Boolean(
    ctx.accountId &&
      ctx.careRecipientId &&
      ctx.role &&
      canViewCareRoutine(ctx.role),
  );
  if (!canOpenElderPreview({ hasSession: true, canViewRoutine: canView })) {
    return { kind: "unlinked" };
  }

  const accountId = ctx.accountId;
  const careRecipientId = ctx.careRecipientId;
  if (!accountId || !careRecipientId) return { kind: "unlinked" };

  const circle = await readCareCircleForElderPreview();
  if (!circle) return { kind: "unlinked" };

  const now = new Date();
  const clock = readZonedClock(now, ELDER_TIME_ZONE);
  const nowMinutes = clock.hour * 60 + clock.minute;
  let medications: ElderMedicationInput[] = [];
  let appointments: ElderAppointmentInput[] = [];
  let loadWarning: string | null = null;

  try {
    const meds = await getHojeMedications({
      careRecipientId,
      timeZone: ELDER_TIME_ZONE,
      now,
    });
    const agenda = await getTodayAgendaSnapshot({
      careRecipientId,
      accountId,
      currentUserId: ctx.userId,
      now,
      timeZone: ELDER_TIME_ZONE,
    });
    const activityTitles = meds.activityFeed.map((item) => item.title);
    medications = meds.medications.map((medication) => ({
      medicationId: medication.medicationId,
      medicationName: medication.medicationName,
      dosageLabel: medication.dosageLabel,
      times: medication.times,
      remindedTimes: remindedTimesFromActivity({
        medicationName: medication.medicationName,
        dosageLabel: medication.dosageLabel,
        times: medication.times,
        activityTitles,
      }),
    }));
    appointments = agenda.timelineItems.flatMap((item) => {
      const clockLabel = item.timeLabel.match(/(\d{1,2}:\d{2})/);
      if (!clockLabel?.[1]) return [];
      return [{ timeLabel: clockLabel[1], title: item.title }];
    });
  } catch {
    logPreviewLoadFailed(accountId, careRecipientId);
    loadWarning = elderContent.schedule.loadError;
  }

  logPreviewOpened(accountId, careRecipientId);

  return {
    kind: "ready",
    greeting: formatElderGreetingLine(clock.hour, circle.careRecipientDisplayName),
    dateLabel: formatElderLongDate(now, ELDER_TIME_ZONE),
    homeCard: loadWarning
      ? { kind: "empty" }
      : buildElderHomeCard(medications, nowMinutes),
    schedule: loadWarning
      ? []
      : buildElderSchedule({ medications, appointments, nowMinutes }),
    calls: buildElderCallList(circle.members),
    loadWarning,
  };
});
