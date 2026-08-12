import { familyContent } from "@/content/family";
import {
  canManageMedications,
  isAccountPaused,
} from "@/modules/accounts/domain/roles";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import {
  buildPackConsumptionDisplay,
  buildScheduledAlerts,
  formatDisplayDate,
  formatRecentReminderLine,
  mapRemediosListItem,
  resolveSelectedMedicationId,
  sortMedicationsByUrgency,
  sortRecentReminderEvents,
  type RemediosListItemDisplay,
  type ScheduledAlertRow,
} from "@/modules/medications/domain/remedios-display";
import { DEFAULT_CARE_TIMEZONE } from "@/modules/medications/domain/hoje-timeline";
import {
  fetchRemediosPageData,
  findMostUrgentRefill,
  type RemediosMedicationSnapshot,
} from "@/modules/medications/infrastructure/medication-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface RemediosDetailViewModel {
  medicationId: string;
  title: string;
  tagLabel: string;
  tagTone: "warning" | "ok" | "muted";
  quantityTotal: number;
  dailyConsumption: number;
  durationDays: number;
  daysRemaining: number;
  startDateLabel: string;
  endDateLabel: string;
  progressPercent: number;
  progressTone: "brand" | "warning";
  consumedCopy: string;
  buyUntilLabel: string;
  packId: string;
  scheduledAlerts: ScheduledAlertRow[];
}

export interface RemediosRecentReminderItem {
  id: string;
  timeLabel: string;
  detail: string;
}

export interface RemediosPageViewModel {
  medications: RemediosListItemDisplay[];
  selectedMedicationId: string | null;
  selectedDetail: RemediosDetailViewModel | null;
  recentReminders: RemediosRecentReminderItem[];
  refillBanner: {
    medicationName: string;
    endDateLabel: string;
    body: string;
  } | null;
  canManage: boolean;
  isPaused: boolean;
  careRecipientId: string;
  careRecipientDisplayName: string;
  activeMedicationCount: number;
  openModal: boolean;
  replacementMedicationId: string | null;
}

export type RemediosPageResult =
  | { ok: true; data: RemediosPageViewModel }
  | { ok: false; message: string };

function getTodayIso(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function buildDetailViewModel(
  med: RemediosMedicationSnapshot,
  packEvents: Array<{ type: string; createdAt: string }>,
  todayIso: string,
  copy: typeof familyContent.remedios,
): RemediosDetailViewModel {
  const listItem = mapRemediosListItem(med, copy.listTags);
  const consumption = buildPackConsumptionDisplay({
    quantityTotal: med.pack.quantityTotal,
    quantityRemaining: med.pack.quantityRemaining,
    startDate: med.pack.startDate,
    endDateEstimated: med.pack.endDateEstimated,
    doseUnits: med.doseUnits,
    dosesPerDay: med.dosesPerDay,
    refillAlertDays: med.refillAlertDays,
    todayIso,
    consumedTemplate: copy.detail.consumedTemplate,
    buyUntilTemplate: copy.detail.buyUntilTemplate,
  });

  const durationDays = Math.floor(
    med.pack.quantityTotal / (med.doseUnits * med.dosesPerDay),
  );

  return {
    medicationId: med.medicationId,
    title: listItem.title,
    tagLabel: listItem.tagLabel,
    tagTone: listItem.tagTone,
    quantityTotal: med.pack.quantityTotal,
    dailyConsumption: med.doseUnits * med.dosesPerDay,
    durationDays,
    daysRemaining: med.daysRemaining,
    startDateLabel: formatDisplayDate(med.pack.startDate),
    endDateLabel: formatDisplayDate(med.pack.endDateEstimated),
    progressPercent: consumption.progressPercent,
    progressTone: consumption.progressTone,
    consumedCopy: consumption.consumedCopy,
    buyUntilLabel: copy.detail.buyUntilTemplate.replace(
      "{data}",
      formatDisplayDate(consumption.buyUntilDate),
    ),
    packId: med.pack.id,
    scheduledAlerts: buildScheduledAlerts({
      endDateEstimated: med.pack.endDateEstimated,
      refillAlertDays: med.refillAlertDays,
      packEvents,
      labels: copy.scheduledAlerts,
    }),
  };
}

export async function getRemediosPage(input: {
  remedioId?: string | null;
  modal?: string | null;
  replacementMedicationId?: string | null;
  now?: Date;
}): Promise<RemediosPageResult> {
  try {
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
    const todayIso = getTodayIso(now, timeZone);
    const supabase = await createSupabaseServerClient();
    const copy = familyContent.remedios;

    const { medications: rawMedications, events } = await fetchRemediosPageData(
      supabase,
      ctx.careRecipientId,
      now,
      timeZone,
    );

    const sorted = sortMedicationsByUrgency(rawMedications);
    const listItems = sorted.map((med) => mapRemediosListItem(med, copy.listTags));
    const medicationIds = listItems.map((item) => item.medicationId);
    const selectedMedicationId = resolveSelectedMedicationId({
      requestedId: input.remedioId ?? null,
      medicationIds,
    });

    const selectedRaw = sorted.find(
      (med) => med.medicationId === selectedMedicationId,
    );

    const actorProfiles = await supabase
      .from("account_members")
      .select("profile_id, profiles(full_name)")
      .eq("account_id", ctx.accountId)
      .eq("status", "active");

    const actorNames = new Map<string, string>();
    for (const row of actorProfiles.data ?? []) {
      const profileId = row.profile_id as string;
      const profile = Array.isArray(row.profiles)
        ? row.profiles[0]
        : row.profiles;
      actorNames.set(
        profileId,
        (profile as { full_name?: string })?.full_name ?? "Alguém",
      );
    }

    const selectedDetail = selectedRaw
      ? buildDetailViewModel(
          selectedRaw,
          events
            .filter((event) => event.packId === selectedRaw.pack.id)
            .map((event) => ({
              type: event.type,
              createdAt: event.createdAt,
            })),
          todayIso,
          copy,
        )
      : null;

    const recentEvents = sortRecentReminderEvents(
      events.filter(
        (event) =>
          selectedMedicationId === null ||
          event.medicationId === selectedMedicationId,
      ),
    ).slice(0, 5);

    const recentReminders = recentEvents.map((event) => {
      const formatted = formatRecentReminderLine({
        type: event.type,
        createdAt: event.createdAt,
        actorName: event.actorProfileId
          ? actorNames.get(event.actorProfileId)
          : null,
        copy: copy.recentReminders,
      });
      return {
        id: event.id,
        timeLabel: formatted.timeLabel,
        detail: formatted.detail,
      };
    });

    const urgent = findMostUrgentRefill(sorted);
    const refillBanner = urgent
      ? {
          medicationName: urgent.name,
          endDateLabel: formatDisplayDate(urgent.pack.endDateEstimated),
          body: copy.refillBanner.body
            .replace("{medicamento}", urgent.name)
            .replace("{data}", formatDisplayDate(urgent.pack.endDateEstimated)),
        }
      : null;

    const openModal = input.modal === "nova";
    const replacementMedicationId =
      input.replacementMedicationId &&
      medicationIds.includes(input.replacementMedicationId)
        ? input.replacementMedicationId
        : null;

    return {
      ok: true,
      data: {
        medications: listItems,
        selectedMedicationId,
        selectedDetail,
        recentReminders,
        refillBanner,
        canManage: canManageMedications(ctx.role),
        isPaused: isAccountPaused(ctx.accountStatus ?? "active"),
        careRecipientId: ctx.careRecipientId,
        careRecipientDisplayName: shell.careRecipientDisplayName,
        activeMedicationCount: listItems.length,
        openModal,
        replacementMedicationId,
      },
    };
  } catch {
    return {
      ok: false,
      message: familyContent.remedios.loadError,
    };
  }
}
