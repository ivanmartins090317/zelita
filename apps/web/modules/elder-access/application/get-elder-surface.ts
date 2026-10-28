import { cache } from "react";
import * as Sentry from "@sentry/nextjs";

import { elderContent } from "@/content/elder";

import { buildElderCallList, type ElderCallRow } from "@/modules/elder-access/domain/elder-call";
import {
  ELDER_TIME_ZONE,
  buildElderHomeCard,
  buildElderSchedule,
  formatElderGreetingLine,
  formatElderLongDate,
  readZonedClock,
  type ElderHomeCard,
  type ElderScheduleItem,
} from "@/modules/elder-access/domain/elder-schedule";
import { getElderPreview, type ElderPreviewResult } from "@/modules/elder-access/application/get-elder-preview";
import { lookupActiveDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import { touchDeviceLastSeen } from "@/modules/elder-access/infrastructure/device-link-store";
import { readBoundElderRoutine } from "@/modules/elder-access/infrastructure/bound-routine-repo";

export interface ElderReadySurface {
  kind: "ready";
  door: "device" | "preview";
  greeting: string;
  dateLabel: string;
  homeCard: ElderHomeCard;
  schedule: ElderScheduleItem[];
  calls: ElderCallRow[];
  loadWarning: string | null;
}

export type ElderSurface = { kind: "unlinked" } | ElderReadySurface;

function logDevice(event: string, accountId?: string, careRecipientId?: string) {
  Sentry.captureMessage(event, {
    level: event.endsWith("failed") ? "error" : "info",
    tags: { event },
    extra: { accountId, careRecipientId },
  });
}

export const getElderSurface = cache(async (): Promise<ElderSurface> => {
  const lookup = await lookupActiveDeviceCookie();
  if (lookup.status === "failed") {
    logDevice("elder_device_lookup_failed");
  }

  if (lookup.status === "active") {
    try {
      const now = new Date();
      const routine = await readBoundElderRoutine(lookup.device, now);
      try {
        await touchDeviceLastSeen(lookup.device.id, now.toISOString());
      } catch {
        logDevice(
          "elder_device_seen_failed",
          lookup.device.accountId,
          lookup.device.careRecipientId,
        );
      }
      const clock = readZonedClock(now, ELDER_TIME_ZONE);
      const nowMinutes = clock.hour * 60 + clock.minute;
      logDevice(
        "elder_device_opened",
        lookup.device.accountId,
        lookup.device.careRecipientId,
      );
      return {
        kind: "ready",
        door: "device",
        greeting: formatElderGreetingLine(clock.hour, routine.displayName),
        dateLabel: formatElderLongDate(now, ELDER_TIME_ZONE),
        homeCard: routine.loadWarning
          ? { kind: "empty" }
          : buildElderHomeCard(routine.medications, nowMinutes),
        schedule: routine.loadWarning
          ? []
          : buildElderSchedule({
              medications: routine.medications,
              appointments: routine.appointments,
              nowMinutes,
            }),
        calls: buildElderCallList(routine.members),
        loadWarning: routine.loadWarning,
      };
    } catch {
      logDevice(
        "elder_device_lookup_failed",
        lookup.device.accountId,
        lookup.device.careRecipientId,
      );
      const now = new Date();
      const clock = readZonedClock(now, ELDER_TIME_ZONE);
      return {
        kind: "ready",
        door: "device",
        greeting: formatElderGreetingLine(clock.hour, ""),
        dateLabel: formatElderLongDate(now, ELDER_TIME_ZONE),
        homeCard: { kind: "empty" },
        schedule: [],
        calls: [],
        loadWarning: elderContent.schedule.loadError,
      };
    }
  }

  const preview: ElderPreviewResult = await getElderPreview();
  if (preview.kind !== "ready") return { kind: "unlinked" };
  return { ...preview, door: "preview" };
});
