/** Fuso de cuidado do MVP — horários de lembrete e DND. */
export const CARE_TIMEZONE = "America/Sao_Paulo";

/** Offset fixo de Brasília (sem horário de verão desde 2019). */
export const CARE_UTC_OFFSET = "-03:00";

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

export function dateKeyInZone(
  date: Date,
  timeZone: string = CARE_TIMEZONE,
): string {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function minutesSinceMidnightInZone(
  date: Date,
  timeZone: string = CARE_TIMEZONE,
): number {
  const parts = getZonedParts(date, timeZone);
  return parts.hour * 60 + parts.minute;
}

export function normalizeClockTime(value: string): string {
  const [hours, minutes] = value.split(":");
  const h = Number(hours);
  const m = Number(minutes);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    throw new Error(
      `Horário inválido "${value}". Use HH:MM (ex.: 08:00).`,
    );
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function zonedDateFromHm(
  dateKey: string,
  hm: string,
  offset: string = CARE_UTC_OFFSET,
): Date {
  const clock = normalizeClockTime(hm);
  const date = new Date(`${dateKey}T${clock}:00.000${offset}`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Não foi possível ancorar ${dateKey} ${clock} em Brasília. Confira a data e o horário.`,
    );
  }
  return date;
}

export interface DaySlot {
  time: string;
  scheduledAt: Date;
}

export function clockMatchesSchedule(
  scheduledAt: Date,
  times: string[],
  timeZone: string = CARE_TIMEZONE,
): boolean {
  const parts = getZonedParts(scheduledAt, timeZone);
  const clock = `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  return times.some((time) => time.slice(0, 5) === clock);
}

export function slotsOnDate(times: string[], dateKey: string): DaySlot[] {
  return times.map((time) => {
    const clock = normalizeClockTime(time.slice(0, 5));
    return { time: clock, scheduledAt: zonedDateFromHm(dateKey, clock) };
  });
}

/** Horários de hoje que ainda não passaram (ao salvar cartela no meio do dia). */
export function remainingSlotsToday(
  times: string[],
  now: Date,
  timeZone: string = CARE_TIMEZONE,
): DaySlot[] {
  const dateKey = dateKeyInZone(now, timeZone);
  return slotsOnDate(times, dateKey).filter(
    (slot) => slot.scheduledAt.getTime() > now.getTime(),
  );
}

export function calendarDaysUntil(
  end: Date,
  now: Date,
  timeZone: string = CARE_TIMEZONE,
): number {
  const endKey = dateKeyInZone(end, timeZone);
  const nowKey = dateKeyInZone(now, timeZone);
  const endUtc = Date.parse(`${endKey}T00:00:00.000Z`);
  const nowUtc = Date.parse(`${nowKey}T00:00:00.000Z`);
  return Math.round((endUtc - nowUtc) / (24 * 60 * 60 * 1000));
}
