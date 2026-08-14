export interface CareRecipientAgeResult {
  birthDateLabel: string;
  ageLabel: string | null;
}

function parseBirthDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatBirthDatePtBr(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Calcula idade em anos completos a partir de YYYY-MM-DD. */
export function computeAgeYears(
  birthDateIso: string,
  now: Date = new Date(),
): number | null {
  const birth = parseBirthDate(birthDateIso);
  if (!birth) return null;

  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(todayParts.find((part) => part.type === "year")?.value);
  const month = Number(todayParts.find((part) => part.type === "month")?.value);
  const day = Number(todayParts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) return null;

  let age = year - birth.getUTCFullYear();
  const monthDiff = month - (birth.getUTCMonth() + 1);
  const dayDiff = day - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function formatCareRecipientBirthDisplay(input: {
  birthDate: string | null;
  now?: Date;
}): CareRecipientAgeResult {
  if (!input.birthDate) {
    return { birthDateLabel: "—", ageLabel: null };
  }

  const parsed = parseBirthDate(input.birthDate);
  if (!parsed) {
    return { birthDateLabel: "—", ageLabel: null };
  }

  const birthDateLabel = formatBirthDatePtBr(parsed);
  const age = computeAgeYears(input.birthDate, input.now);
  const ageLabel = age != null ? `${age} anos` : null;

  return { birthDateLabel, ageLabel };
}
