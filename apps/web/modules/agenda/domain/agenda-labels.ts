import { getZonedParts } from "@/modules/medications/domain/hoje-timeline";

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toDateKeyFromParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function formatAppointmentDateTime(input: {
  startsAt: string;
  now: Date;
  timeZone: string;
  todayLabel: string;
}): string {
  const startParts = getZonedParts(new Date(input.startsAt), input.timeZone);
  const todayParts = getZonedParts(input.now, input.timeZone);
  const timeLabel = new Intl.DateTimeFormat("pt-BR", {
    timeZone: input.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(input.startsAt));

  const isToday =
    startParts.year === todayParts.year &&
    startParts.month === todayParts.month &&
    startParts.day === todayParts.day;

  if (isToday) {
    return `${input.todayLabel} ${timeLabel}`;
  }

  const dateKey = toDateKeyFromParts(
    startParts.year,
    startParts.month,
    startParts.day,
  );
  const weekday = WEEKDAY_NAMES[new Date(`${dateKey}T12:00:00.000Z`).getUTCDay()];
  return `${weekday} ${formatDisplayDate(dateKey)}, ${timeLabel}`;
}

export function formatWeekTitle(input: {
  startDay: number;
  endDay: number;
  monthLabel: string;
  template: string;
}): string {
  return input.template
    .replace("{inicio}", String(input.startDay))
    .replace("{fim}", String(input.endDay))
    .replace("{mes}", input.monthLabel);
}

export function formatCompanionTag(
  companionName: string | null,
  template: string,
): string | null {
  if (!companionName?.trim()) return null;
  const shortName = companionName.trim().split(/\s+/)[0] ?? companionName;
  return template.replace("{nome}", shortName);
}

export function formatAssigneeLine(input: {
  assigneeName: string | null;
  currentUserId: string;
  assigneeProfileId: string | null;
  assignedToYou: string;
  assignedToTemplate: string;
  anyoneLabel: string;
}): string {
  if (!input.assigneeProfileId) {
    return input.anyoneLabel;
  }
  if (input.assigneeProfileId === input.currentUserId) {
    return input.assignedToYou;
  }
  const name = input.assigneeName ?? "alguém";
  return input.assignedToTemplate.replace("{nome}", name);
}

export function formatTaskDueLine(input: {
  dueDate: string | null;
  assigneeLine: string;
  untilTemplate: string;
  separator: string;
}): string {
  const parts: string[] = [];
  if (input.dueDate) {
    parts.push(
      input.untilTemplate.replace("{data}", formatDisplayDate(input.dueDate)),
    );
  }
  parts.push(input.assigneeLine);
  return parts.join(input.separator);
}

export function isDateOnOrBefore(
  dateKey: string,
  referenceDateKey: string,
): boolean {
  return parseDateKey(dateKey).getTime() <= parseDateKey(referenceDateKey).getTime();
}

export function isSameDateKey(isoOrDate: string, dateKey: string, timeZone: string): boolean {
  const parts = getZonedParts(new Date(isoOrDate), timeZone);
  const key = toDateKeyFromParts(parts.year, parts.month, parts.day);
  return key === dateKey;
}
