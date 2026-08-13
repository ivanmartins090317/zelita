import { getZonedParts } from "@/modules/medications/domain/hoje-timeline";

export interface WeekDayColumn {
  dateKey: string;
  dayAbbrev: string;
  dayNumber: number;
  isToday: boolean;
}

export interface WeekGridCellItem {
  kind: "medication" | "appointment";
  label: string;
}

export interface WeekGridCell {
  items: WeekGridCellItem[];
  isEmpty: boolean;
}

export interface WeekGridRow {
  timeLabel: string;
  sortKey: number;
  cells: WeekGridCell[];
}

export interface WeekGridResult {
  weekStartDateKey: string;
  weekEndDateKey: string;
  days: WeekDayColumn[];
  rows: WeekGridRow[];
  titleInterval: { startDay: number; endDay: number; monthLabel: string };
}

const DAY_ABBREVS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const utc = Date.UTC(year, month - 1, day + days);
  const d = new Date(utc);
  return toDateKey(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

function getDayOfWeek(dateKey: string): number {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getTodayDateKey(now: Date, timeZone: string): string {
  const parts = getZonedParts(now, timeZone);
  return toDateKey(parts.year, parts.month, parts.day);
}

export function getSundayOfWeek(dateKey: string): string {
  const dow = getDayOfWeek(dateKey);
  return addDays(dateKey, -dow);
}

export function parseWeekParam(
  param: string | null | undefined,
  now: Date,
  timeZone: string,
): string {
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    const dow = getDayOfWeek(param);
    if (dow === 0) return param;
    return getSundayOfWeek(param);
  }
  return getSundayOfWeek(getTodayDateKey(now, timeZone));
}

export function buildWeekDays(
  weekStartDateKey: string,
  todayDateKey: string,
): WeekDayColumn[] {
  const days: WeekDayColumn[] = [];
  for (let i = 0; i < 7; i += 1) {
    const dateKey = addDays(weekStartDateKey, i);
    const { day } = parseDateKey(dateKey);
    days.push({
      dateKey,
      dayAbbrev: DAY_ABBREVS[i],
      dayNumber: day,
      isToday: dateKey === todayDateKey,
    });
  }
  return days;
}

function formatTimeFromIso(iso: string, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return formatter.format(new Date(iso));
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function normalizeTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours?.padStart(2, "0")}:${minutes?.padStart(2, "0")}`;
}

function getDateKeyFromIso(iso: string, timeZone: string): string {
  const parts = getZonedParts(new Date(iso), timeZone);
  return toDateKey(parts.year, parts.month, parts.day);
}

export interface WeekGridMedicationInput {
  name: string;
  times: string[];
}

export interface WeekGridAppointmentInput {
  title: string;
  startsAt: string;
  status: string;
}

export function buildWeekGrid(input: {
  weekStartDateKey: string;
  todayDateKey: string;
  timeZone: string;
  medications: WeekGridMedicationInput[];
  appointments: WeekGridAppointmentInput[];
}): WeekGridResult {
  const days = buildWeekDays(input.weekStartDateKey, input.todayDateKey);
  const weekEndDateKey = days[6]?.dateKey ?? input.weekStartDateKey;

  const scheduledAppointments = input.appointments.filter(
    (item) => item.status === "scheduled",
  );

  const appointmentSlots = new Map<string, Map<string, string[]>>();
  for (const appt of scheduledAppointments) {
    const dateKey = getDateKeyFromIso(appt.startsAt, input.timeZone);
    const timeLabel = normalizeTime(
      formatTimeFromIso(appt.startsAt, input.timeZone),
    );
    if (!appointmentSlots.has(timeLabel)) {
      appointmentSlots.set(timeLabel, new Map());
    }
    const dayMap = appointmentSlots.get(timeLabel)!;
    const existing = dayMap.get(dateKey) ?? [];
    existing.push(appt.title);
    dayMap.set(dateKey, existing);
  }

  const medicationTimes = new Set<string>();
  const medicationsByTime = new Map<string, string[]>();

  for (const med of input.medications) {
    for (const time of med.times) {
      const normalized = normalizeTime(time);
      medicationTimes.add(normalized);
      const existing = medicationsByTime.get(normalized) ?? [];
      existing.push(med.name);
      medicationsByTime.set(normalized, existing);
    }
  }

  const timeSet = new Set<string>([
    ...medicationTimes,
    ...appointmentSlots.keys(),
  ]);

  const sortedTimes = [...timeSet].sort(
    (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b),
  );

  const rows: WeekGridRow[] = sortedTimes.map((timeLabel) => {
    const medLabels = medicationsByTime.get(timeLabel) ?? [];
    const medCombined =
      medLabels.length > 0 ? medLabels.join(" + ") : null;
    const apptDayMap = appointmentSlots.get(timeLabel);

    const cells: WeekGridCell[] = days.map((day) => {
      const items: WeekGridCellItem[] = [];
      if (medCombined) {
        items.push({ kind: "medication", label: medCombined });
      }
      const apptLabels = apptDayMap?.get(day.dateKey) ?? [];
      for (const label of apptLabels) {
        items.push({ kind: "appointment", label });
      }
      return { items, isEmpty: items.length === 0 };
    });

    return {
      timeLabel,
      sortKey: parseTimeToMinutes(timeLabel),
      cells,
    };
  });

  const startParts = parseDateKey(input.weekStartDateKey);
  const endParts = parseDateKey(weekEndDateKey);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: input.timeZone,
  }).format(
    new Date(Date.UTC(startParts.year, startParts.month - 1, startParts.day)),
  );

  return {
    weekStartDateKey: input.weekStartDateKey,
    weekEndDateKey,
    days,
    rows,
    titleInterval: {
      startDay: startParts.day,
      endDay: endParts.day,
      monthLabel,
    },
  };
}

export function shiftWeek(dateKey: string, direction: -1 | 1): string {
  return addDays(dateKey, direction * 7);
}
