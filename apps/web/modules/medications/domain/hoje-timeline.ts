import { shouldWarnRefill } from "./pack-end";

/** Fuso padrão documentado — ver onboarding-checklist.ts (reexportado pelo dashboard). */
export const DEFAULT_CARE_TIMEZONE = "America/Sao_Paulo";

export interface MedicationScheduleSnapshot {
  medicationId: string;
  medicationName: string;
  dosageLabel: string;
  times: string[];
  endDateEstimated: string;
  daysRemaining: number;
  refillAlertDays: number;
  createdAt: string;
}

export interface MedicationEventSnapshot {
  id: string;
  type: string;
  medicationId: string | null;
  createdAt: string;
  actorProfileId: string | null;
}

export type TimelineVariant = "default" | "muted" | "warning";

export interface TimelineItem {
  sortKey: number;
  timeLabel: string;
  title: string;
  subtitle?: string;
  variant: TimelineVariant;
  href?: string;
  linkLabel?: string;
}

export interface NextMedicationStat {
  timeLabel: string;
  medicationLabel: string;
  hint: string;
}

export interface RefillAlertSummary {
  count: number;
  mostUrgentName: string | null;
  mostUrgentDays: number | null;
}

export interface ActivityFeedItem {
  id: string;
  initials: string;
  title: string;
  subtitle: string;
  roleLabel?: string;
  sortKey: number;
}

const GREETING_MORNING = "Bom dia";
const GREETING_AFTERNOON = "Boa tarde";
const GREETING_EVENING = "Boa noite";

export function resolveTimeGreeting(hour: number): string {
  if (hour < 12) return GREETING_MORNING;
  if (hour < 18) return GREETING_AFTERNOON;
  return GREETING_EVENING;
}

export function formatLongDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);
}

export function deriveUrgencyLine(
  refillAlertCount: number,
  apelido: string,
  urgentCopy: string,
  calmCopy: string,
): string {
  if (refillAlertCount > 0) {
    return urgentCopy.replace("{apelido}", apelido);
  }
  return calmCopy.replace("{apelido}", apelido);
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours?.padStart(2, "0")}:${minutes?.padStart(2, "0")}`;
}

export function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour") % 24,
    minute: read("minute"),
  };
}

export function getDayBounds(
  now: Date,
  timeZone: string,
): { startIso: string; endIso: string; dateKey: string } {
  const { year, month, day } = getZonedParts(now, timeZone);
  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const startIso = `${dateKey}T00:00:00.000-03:00`;
  const endIso = `${dateKey}T23:59:59.999-03:00`;
  return { startIso, endIso, dateKey };
}

function isEventOnDate(
  eventIso: string,
  dateKey: string,
  timeZone: string,
): boolean {
  const eventDate = getZonedParts(new Date(eventIso), timeZone);
  const key = `${eventDate.year}-${String(eventDate.month).padStart(2, "0")}-${String(eventDate.day).padStart(2, "0")}`;
  return key === dateKey;
}

function findEventForSlot(
  medicationId: string,
  events: MedicationEventSnapshot[],
  dateKey: string,
  timeZone: string,
): MedicationEventSnapshot | undefined {
  return events.find(
    (event) =>
      event.medicationId === medicationId &&
      (event.type === "reminder_sent" || event.type === "manual_confirmation") &&
      isEventOnDate(event.createdAt, dateKey, timeZone),
  );
}

export function formatRelativeUntil(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "agora";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `daqui a ${hours}h${String(minutes).padStart(2, "0")}`;
  if (hours > 0) return `daqui a ${hours}h`;
  return `daqui a ${minutes} min`;
}

export function computeRefillAlertSummary(
  medications: MedicationScheduleSnapshot[],
): RefillAlertSummary {
  const alerts = medications
    .filter((med) =>
      shouldWarnRefill(med.daysRemaining, med.refillAlertDays),
    )
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    count: alerts.length,
    mostUrgentName: alerts[0]?.medicationName ?? null,
    mostUrgentDays: alerts[0]?.daysRemaining ?? null,
  };
}

export function findNextMedication(
  medications: MedicationScheduleSnapshot[],
  now: Date,
  timeZone: string,
): NextMedicationStat | null {
  const { dateKey } = getDayBounds(now, timeZone);
  const zonedNow = getZonedParts(now, timeZone);
  const nowMinutes = zonedNow.hour * 60 + zonedNow.minute;

  interface Candidate {
    sortKey: number;
    timeLabel: string;
    medicationLabel: string;
    target: Date;
  }

  const candidates: Candidate[] = [];

  for (const med of medications) {
    for (const time of med.times) {
      const minutes = parseTimeToMinutes(time);
      const timeLabel = formatTimeLabel(time);
      const target = new Date(`${dateKey}T${timeLabel}:00.000-03:00`);
      candidates.push({
        sortKey: minutes,
        timeLabel,
        medicationLabel: `${med.medicationName} ${med.dosageLabel}`,
        target,
      });
    }
  }

  const todayFuture = candidates
    .filter((item) => item.sortKey > nowMinutes)
    .sort((a, b) => a.sortKey - b.sortKey);

  const next =
    todayFuture[0] ??
    candidates.sort((a, b) => a.sortKey - b.sortKey)[0] ??
    null;

  if (!next) return null;

  return {
    timeLabel: next.timeLabel,
    medicationLabel: next.medicationLabel,
    hint: formatRelativeUntil(next.target, now),
  };
}

export interface BuildTimelineCopy {
  completedStatus: string;
  reminderSent: string;
  notConfirmed: string;
  confirmed: string;
  upcoming: string;
  refillTitle: string;
  refillSubtitle: string;
  linkLabel: string;
}

export function buildDayTimeline(
  medications: MedicationScheduleSnapshot[],
  events: MedicationEventSnapshot[],
  now: Date,
  timeZone: string,
  copy: BuildTimelineCopy,
  remediosHref: string,
): TimelineItem[] {
  const { dateKey } = getDayBounds(now, timeZone);
  const zonedNow = getZonedParts(now, timeZone);
  const nowMinutes = zonedNow.hour * 60 + zonedNow.minute;
  const items: TimelineItem[] = [];

  for (const med of medications) {
    for (const time of med.times) {
      const minutes = parseTimeToMinutes(time);
      const timeLabel = formatTimeLabel(time);
      const event = findEventForSlot(med.medicationId, events, dateKey, timeZone);
      const medLabel = `${med.medicationName} ${med.dosageLabel}`;

      if (minutes <= nowMinutes && event) {
        const isConfirmed = event.type === "manual_confirmation";
        items.push({
          sortKey: minutes,
          timeLabel: `${timeLabel} · ${copy.completedStatus}`,
          title: copy.reminderSent.replace("{medicamento}", medLabel),
          subtitle: isConfirmed
            ? copy.confirmed
            : copy.notConfirmed,
          variant: "default",
        });
        continue;
      }

      if (minutes > nowMinutes) {
        items.push({
          sortKey: minutes,
          timeLabel: `${timeLabel} · previsto`,
          title: copy.upcoming.replace("{medicamento}", medLabel),
          variant: "muted",
        });
      }
    }

    if (shouldWarnRefill(med.daysRemaining, med.refillAlertDays)) {
      items.push({
        sortKey: nowMinutes + 0.5,
        timeLabel: copy.refillSubtitle.includes("{dias}")
          ? "alerta"
          : "alerta",
        title: copy.refillTitle
          .replace("{medicamento}", med.medicationName)
          .replace("{dias}", String(med.daysRemaining)),
        subtitle: copy.refillSubtitle.replace(
          "{data}",
          med.endDateEstimated.split("-").reverse().join("/"),
        ),
        variant: "warning",
        href: remediosHref,
        linkLabel: copy.linkLabel,
      });
    }
  }

  return items.sort((a, b) => a.sortKey - b.sortKey);
}

export interface BuildActivityCopy {
  reminderSent: string;
  refillWarning: string;
  manualConfirmation: string;
  medicationAdded: string;
  emptyToday: string;
}

export function buildActivityFeed(
  medications: MedicationScheduleSnapshot[],
  events: MedicationEventSnapshot[],
  actorNames: Map<string, string>,
  roleLabels: Map<string, string>,
  copy: BuildActivityCopy,
  now: Date,
  timeZone: string,
  maxItems = 5,
): ActivityFeedItem[] {
  const { dateKey } = getDayBounds(now, timeZone);
  const medById = new Map(medications.map((med) => [med.medicationId, med]));
  const items: ActivityFeedItem[] = [];

  for (const event of events) {
    const med = event.medicationId ? medById.get(event.medicationId) : undefined;
    const medLabel = med
      ? `${med.medicationName} ${med.dosageLabel}`
      : "remédio";

    let title = "";
    if (event.type === "reminder_sent") {
      title = copy.reminderSent.replace("{medicamento}", medLabel);
    } else if (event.type === "pack_refill_warning") {
      title = copy.refillWarning.replace("{medicamento}", medLabel);
    } else if (event.type === "manual_confirmation") {
      title = copy.manualConfirmation.replace("{medicamento}", medLabel);
    } else {
      continue;
    }

    const actorName = event.actorProfileId
      ? actorNames.get(event.actorProfileId) ?? "Alguém"
      : "Zelita";
    const initials = buildInitials(actorName);
    const relative = formatRelativeDate(new Date(event.createdAt), now);

    items.push({
      id: event.id,
      initials,
      title: `${actorName} — ${title}`,
      subtitle: relative,
      roleLabel: event.actorProfileId
        ? roleLabels.get(event.actorProfileId)
        : undefined,
      sortKey: new Date(event.createdAt).getTime(),
    });
  }

  for (const med of medications) {
    if (!isEventOnDate(med.createdAt, dateKey, timeZone)) continue;
    items.push({
      id: `med-created-${med.medicationId}`,
      initials: "V",
      title: copy.medicationAdded.replace(
        "{medicamento}",
        `${med.medicationName} ${med.dosageLabel}`,
      ),
      subtitle: formatRelativeDate(new Date(med.createdAt), now),
      sortKey: new Date(med.createdAt).getTime(),
    });
  }

  return items
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, maxItems);
}

export function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatRelativeDate(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "ontem";
  return `há ${diffDays} dias`;
}
