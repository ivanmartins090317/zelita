import {
  computeDailyConsumption,
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "./pack-end";

export interface RemediosListItemInput {
  medicationId: string;
  name: string;
  dosageLabel: string;
  times: string[];
  doseUnits: number;
  dosesPerDay: number;
  daysRemaining: number;
  refillAlertDays: number;
}

export interface RemediosListItemDisplay extends RemediosListItemInput {
  title: string;
  subtitle: string;
  tagLabel: string;
  tagTone: "warning" | "ok" | "muted";
  shouldWarn: boolean;
}

export interface PackConsumptionDisplay {
  consumedUnits: number;
  progressPercent: number;
  progressTone: "brand" | "warning";
  consumedCopy: string;
  buyUntilDate: string;
}

export interface ScheduledAlertRow {
  id: string;
  label: string;
  scheduledDate: string;
  statusLabel: string;
  statusTone: "warning" | "muted";
  recipientCopy: string;
  eventType: string | null;
}

export interface PackAlertEvent {
  type: string;
  createdAt: string;
}

const EVENT_PRIORITY = [
  "reminder_sent",
  "manual_confirmation",
  "pack_refill_warning",
  "voice_fallback",
] as const;

const DISPLAY_DATE = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const DISPLAY_DATETIME = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function addUtcDaysFromIso(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function diffUtcDays(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso).getTime();
  const to = parseIsoDate(toIso).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function formatDisplayDate(isoDate: string): string {
  return DISPLAY_DATE.format(parseIsoDate(isoDate));
}

export function formatDisplayDateTime(isoDateTime: string): string {
  return DISPLAY_DATETIME.format(new Date(isoDateTime));
}

export function formatTimesLabel(times: string[]): string {
  if (times.length === 0) return "";
  if (times.length === 1) return times[0];
  if (times.length === 2) return `${times[0]} e ${times[1]}`;
  return `${times.slice(0, -1).join(", ")} e ${times[times.length - 1]}`;
}

export function formatDoseFrequencyLabel(dosesPerDay: number): string {
  if (dosesPerDay === 1) return "1x ao dia";
  return `${dosesPerDay}x ao dia`;
}

export function formatDoseUnitsLabel(doseUnits: number): string {
  if (doseUnits === 1) return "1 comprimido";
  return `${doseUnits} comprimidos`;
}

export function formatMedicationListSubtitle(input: {
  doseUnits: number;
  dosesPerDay: number;
  times: string[];
  asNeededCopy: string;
  noScheduleCopy: string;
}): string {
  if (input.times.length === 0) {
    return input.asNeededCopy;
  }
  return `${formatDoseUnitsLabel(input.doseUnits)} · ${formatDoseFrequencyLabel(input.dosesPerDay)} · ${formatTimesLabel(input.times)}`;
}

export function resolveListTag(input: {
  times: string[];
  daysRemaining: number;
  refillAlertDays: number;
  warnLabel: string;
  okLabel: string;
  noReminderLabel: string;
}): Pick<RemediosListItemDisplay, "tagLabel" | "tagTone" | "shouldWarn"> {
  if (input.times.length === 0) {
    return {
      tagLabel: input.noReminderLabel,
      tagTone: "muted",
      shouldWarn: false,
    };
  }

  const warn = shouldWarnRefill(input.daysRemaining, input.refillAlertDays);
  if (warn) {
    return {
      tagLabel: input.warnLabel.replace("{dias}", String(input.daysRemaining)),
      tagTone: "warning",
      shouldWarn: true,
    };
  }

  return {
    tagLabel: input.okLabel.replace("{dias}", String(input.daysRemaining)),
    tagTone: "ok",
    shouldWarn: false,
  };
}

export function sortMedicationsByUrgency<T extends { daysRemaining: number; name: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export function mapRemediosListItem(
  input: RemediosListItemInput,
  copy: {
    asNeeded: string;
    noSchedule: string;
    warnDays: string;
    okDays: string;
    noReminder: string;
  },
): RemediosListItemDisplay {
  const tag = resolveListTag({
    times: input.times,
    daysRemaining: input.daysRemaining,
    refillAlertDays: input.refillAlertDays,
    warnLabel: copy.warnDays,
    okLabel: copy.okDays,
    noReminderLabel: copy.noReminder,
  });

  return {
    ...input,
    title: `${input.name} ${input.dosageLabel}`.trim(),
    subtitle: formatMedicationListSubtitle({
      doseUnits: input.doseUnits,
      dosesPerDay: input.dosesPerDay,
      times: input.times,
      asNeededCopy: copy.asNeeded,
      noScheduleCopy: copy.noSchedule,
    }),
    ...tag,
  };
}

export function computeBuyUntilDate(
  endDateEstimated: string,
  refillAlertDays: number = DEFAULT_REFILL_ALERT_DAYS,
): string {
  return addUtcDaysFromIso(endDateEstimated, -refillAlertDays);
}

export function computeEstimatedConsumption(input: {
  quantityTotal: number;
  quantityRemaining: number;
  startDate: string;
  doseUnits: number;
  dosesPerDay: number;
  todayIso: string;
}): number {
  if (input.quantityRemaining < input.quantityTotal) {
    return Math.min(
      input.quantityTotal - input.quantityRemaining,
      input.quantityTotal,
    );
  }

  const elapsedDays = Math.max(
    0,
    diffUtcDays(input.startDate, input.todayIso),
  );
  const daily = computeDailyConsumption(input.doseUnits, input.dosesPerDay);
  return Math.min(elapsedDays * daily, input.quantityTotal);
}

export function buildPackConsumptionDisplay(input: {
  quantityTotal: number;
  quantityRemaining: number;
  startDate: string;
  endDateEstimated: string;
  doseUnits: number;
  dosesPerDay: number;
  refillAlertDays: number;
  todayIso: string;
  consumedTemplate: string;
  buyUntilTemplate: string;
}): PackConsumptionDisplay {
  const consumedUnits = computeEstimatedConsumption({
    quantityTotal: input.quantityTotal,
    quantityRemaining: input.quantityRemaining,
    startDate: input.startDate,
    doseUnits: input.doseUnits,
    dosesPerDay: input.dosesPerDay,
    todayIso: input.todayIso,
  });

  const progressPercent =
    input.quantityTotal > 0
      ? Math.round((consumedUnits / input.quantityTotal) * 100)
      : 0;

  const daysRemaining = diffUtcDays(input.todayIso, input.endDateEstimated);
  const progressTone = shouldWarnRefill(daysRemaining, input.refillAlertDays)
    ? "warning"
    : "brand";

  const buyUntilDate = computeBuyUntilDate(
    input.endDateEstimated,
    input.refillAlertDays,
  );

  return {
    consumedUnits,
    progressPercent,
    progressTone,
    consumedCopy: input.consumedTemplate
      .replace("{consumido}", String(Math.round(consumedUnits)))
      .replace("{total}", String(Math.round(input.quantityTotal))),
    buyUntilDate,
  };
}

export function buildScheduledAlerts(input: {
  endDateEstimated: string;
  refillAlertDays: number;
  packEvents: PackAlertEvent[];
  labels: {
    refillDays: string;
    endsTomorrow: string;
    lastPill: string;
    registerPurchase: string;
    sentAt: string;
    scheduledFor: string;
    recipients: string;
  };
}): ScheduledAlertRow[] {
  const refillDate = computeBuyUntilDate(
    input.endDateEstimated,
    input.refillAlertDays,
  );
  const tomorrowDate = addUtcDaysFromIso(input.endDateEstimated, -1);
  const dayAfterEnd = addUtcDaysFromIso(input.endDateEstimated, 1);

  const findEvent = (type: string) =>
    input.packEvents.find((event) => event.type === type);

  function resolveStatus(
    eventType: string | null,
    scheduledDate: string,
  ): Pick<ScheduledAlertRow, "statusLabel" | "statusTone"> {
    if (eventType) {
      const event = findEvent(eventType);
      if (event) {
        return {
          statusLabel: input.labels.sentAt.replace(
            "{data}",
            formatDisplayDateTime(event.createdAt),
          ),
          statusTone: "warning",
        };
      }
    }

    return {
      statusLabel: input.labels.scheduledFor.replace(
        "{data}",
        formatDisplayDate(scheduledDate),
      ),
      statusTone: "muted",
    };
  }

  const rows: ScheduledAlertRow[] = [
    {
      id: "refill-warning",
      label: input.labels.refillDays.replace(
        "{dias}",
        String(input.refillAlertDays),
      ),
      scheduledDate: refillDate,
      eventType: "pack_refill_warning",
      recipientCopy: input.labels.recipients,
      ...resolveStatus("pack_refill_warning", refillDate),
    },
    {
      id: "ends-tomorrow",
      label: input.labels.endsTomorrow,
      scheduledDate: tomorrowDate,
      eventType: null,
      recipientCopy: input.labels.recipients,
      ...resolveStatus(null, tomorrowDate),
    },
    {
      id: "last-pill",
      label: input.labels.lastPill,
      scheduledDate: input.endDateEstimated,
      eventType: "pack_last_day",
      recipientCopy: input.labels.recipients,
      ...resolveStatus("pack_last_day", input.endDateEstimated),
    },
    {
      id: "register-purchase",
      label: input.labels.registerPurchase,
      scheduledDate: dayAfterEnd,
      eventType: null,
      recipientCopy: input.labels.recipients,
      ...resolveStatus(null, dayAfterEnd),
    },
  ];

  return rows;
}

export function resolveSelectedMedicationId(input: {
  requestedId: string | null;
  medicationIds: string[];
}): string | null {
  if (input.medicationIds.length === 0) return null;
  if (
    input.requestedId &&
    input.medicationIds.includes(input.requestedId)
  ) {
    return input.requestedId;
  }
  return input.medicationIds[0] ?? null;
}

export function buildPackPreview(input: {
  quantityTotal: number;
  doseUnits: number;
  dosesPerDay: number;
  startDate: string;
  refillAlertDays?: number;
  invalidCopy: string;
}):
  | {
      ok: true;
      dailyLabel: string;
      durationDays: number;
      endDate: string;
      buyUntilDate: string;
    }
  | { ok: false; message: string } {
  try {
    const result = computePackEnd({
      quantityTotal: input.quantityTotal,
      doseUnits: input.doseUnits,
      dosesPerDay: input.dosesPerDay,
      startDate: parseIsoDate(input.startDate),
    });

    const endDate = result.endDateEstimated.toISOString().slice(0, 10);
    const buyUntilDate = computeBuyUntilDate(
      endDate,
      input.refillAlertDays ?? DEFAULT_REFILL_ALERT_DAYS,
    );

    return {
      ok: true,
      dailyLabel: `${result.dailyConsumption} comprimido${result.dailyConsumption === 1 ? "" : "s"}/dia`,
      durationDays: result.durationDays,
      endDate,
      buyUntilDate,
    };
  } catch {
    return { ok: false, message: input.invalidCopy };
  }
}

export function sortRecentReminderEvents<T extends { type: string; createdAt: string }>(
  events: T[],
): T[] {
  return [...events].sort((a, b) => {
    const priorityA = EVENT_PRIORITY.indexOf(
      a.type as (typeof EVENT_PRIORITY)[number],
    );
    const priorityB = EVENT_PRIORITY.indexOf(
      b.type as (typeof EVENT_PRIORITY)[number],
    );
    const rankA = priorityA === -1 ? EVENT_PRIORITY.length : priorityA;
    const rankB = priorityB === -1 ? EVENT_PRIORITY.length : priorityB;
    if (rankA !== rankB) return rankA - rankB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function formatRecentReminderLine(input: {
  type: string;
  createdAt: string;
  actorName?: string | null;
  copy: {
    reminderSent: string;
    manualConfirmation: string;
    refillWarning: string;
    voiceFallback: string;
    notConfirmed: string;
  };
}): { timeLabel: string; detail: string } {
  const timeLabel = formatDisplayDateTime(input.createdAt);

  if (input.type === "manual_confirmation") {
    const actor = input.actorName ?? "alguém da família";
    return {
      timeLabel,
      detail: input.copy.manualConfirmation.replace("{ator}", actor),
    };
  }

  if (input.type === "pack_refill_warning") {
    return { timeLabel, detail: input.copy.refillWarning };
  }

  if (input.type === "voice_fallback") {
    return { timeLabel, detail: input.copy.voiceFallback };
  }

  return {
    timeLabel,
    detail: `${input.copy.reminderSent} · ${input.copy.notConfirmed}`,
  };
}
