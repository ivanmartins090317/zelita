import type {
  ActivityFeedItem,
  MedicationEventSnapshot,
  MedicationScheduleSnapshot,
  NextMedicationStat,
  RefillAlertSummary,
  TimelineItem,
} from "@/modules/medications/domain/hoje-timeline";
import {
  buildActivityFeed,
  buildDayTimeline,
  computeRefillAlertSummary,
  findNextMedication,
} from "@/modules/medications/domain/hoje-timeline";
import {
  fetchHojeMedicationData,
  mapRefillAttentionItems,
  type RefillAttentionItem,
} from "@/modules/medications/infrastructure/medication-read-repo";
import { familyContent, familyRoutes } from "@/content/family";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HojeMedicationsViewModel {
  medications: MedicationScheduleSnapshot[];
  activeMedicationCount: number;
  nextMedication: NextMedicationStat | null;
  refillSummary: RefillAlertSummary;
  timeline: TimelineItem[];
  refillAttention: RefillAttentionItem[];
  activityFeed: ActivityFeedItem[];
}

export async function getHojeMedications(input: {
  careRecipientId: string;
  timeZone: string;
  now?: Date;
  actorNames?: Map<string, string>;
  roleLabels?: Map<string, string>;
}): Promise<HojeMedicationsViewModel> {
  const now = input.now ?? new Date();
  const supabase = await createSupabaseServerClient();
  const { medications, events } = await fetchHojeMedicationData(
    supabase,
    input.careRecipientId,
    now,
    input.timeZone,
  );

  const copy = familyContent.hoje;
  const timeline = buildDayTimeline(
    medications,
    events,
    now,
    input.timeZone,
    {
      completedStatus: copy.timeline.completedStatus,
      reminderSent: copy.timeline.reminderSent,
      notConfirmed: copy.timeline.notConfirmed,
      confirmed: copy.timeline.confirmed,
      upcoming: copy.timeline.upcoming,
      refillTitle: copy.timeline.refillTitle,
      refillSubtitle: copy.timeline.refillSubtitle,
      linkLabel: copy.timeline.refillLink,
    },
    familyRoutes.remedios,
  );

  const activityFeed = buildActivityFeed(
    medications,
    events,
    input.actorNames ?? new Map(),
    input.roleLabels ?? new Map(),
    {
      reminderSent: copy.activity.reminderSent,
      refillWarning: copy.activity.refillWarning,
      manualConfirmation: copy.activity.manualConfirmation,
      medicationAdded: copy.activity.medicationAdded,
      emptyToday: copy.activity.emptyToday,
    },
    now,
    input.timeZone,
  );

  return {
    medications,
    activeMedicationCount: medications.length,
    nextMedication: findNextMedication(medications, now, input.timeZone),
    refillSummary: computeRefillAlertSummary(medications),
    timeline,
    refillAttention: mapRefillAttentionItems(medications),
    activityFeed,
  };
}

export type { MedicationEventSnapshot, MedicationScheduleSnapshot };
