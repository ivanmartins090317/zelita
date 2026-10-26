const SCHEDULE_TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

export const INVALID_SCHEDULE_TIMES_MESSAGE =
  "Cada dose precisa de um horário válido e diferente (ex.: 08:00 e 09:30).";

export function normalizeScheduleTime(value: string): string | null {
  const match = SCHEDULE_TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function parseScheduleTimes(
  raw: string,
  dosesPerDay: number,
): string[] | null {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const times = parts
    .map(normalizeScheduleTime)
    .filter((time): time is string => time !== null);
  if (times.length !== dosesPerDay || times.length !== parts.length) return null;
  if (new Set(times).size !== times.length) return null;
  return [...times].sort((left, right) => left.localeCompare(right));
}
