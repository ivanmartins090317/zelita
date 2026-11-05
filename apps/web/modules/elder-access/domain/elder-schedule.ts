export const ELDER_TIME_ZONE = "America/Sao_Paulo";

export const ELDER_SLOT_LABELS = {
  already: "Já avisamos",
  next: "É o próximo",
  later: "Mais tarde",
} as const;

export type ElderSlotLabel =
  (typeof ELDER_SLOT_LABELS)[keyof typeof ELDER_SLOT_LABELS];

const GREETINGS = {
  morning: "Bom dia",
  afternoon: "Boa tarde",
  night: "Boa noite",
} as const;

export function resolveElderGreeting(hour: number): string {
  if (hour < 12) return GREETINGS.morning;
  if (hour < 18) return GREETINGS.afternoon;
  return GREETINGS.night;
}

export function readZonedClock(
  date: Date,
  timeZone: string,
): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hourRaw = Number(
    parts.find((part) => part.type === "hour")?.value ?? 0,
  );
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return { hour: hourRaw % 24, minute };
}

export function formatElderLongDate(date: Date, timeZone: string): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);
  if (!formatted) return formatted;
  return formatted.charAt(0).toLocaleUpperCase("pt-BR") + formatted.slice(1);
}

export function elderFirstName(displayName: string): string {
  const first = displayName.trim().split(/\s+/).filter(Boolean)[0];
  return first ?? "";
}

export function formatElderGreetingLine(
  hour: number,
  displayName: string,
): string {
  const greeting = resolveElderGreeting(hour);
  const name = elderFirstName(displayName);
  if (!name) return greeting;
  return `${greeting}, ${name}`;
}

export interface ParsedClock {
  minutes: number;
  label: string;
}

export function parseClock(time: string): ParsedClock | null {
  const match = time.trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return {
    minutes: hour * 60 + minute,
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export interface ElderMedicationInput {
  medicationId: string;
  medicationName: string;
  dosageLabel: string;
  times: string[];
  remindedTimes: string[];
}

export interface ElderAppointmentInput {
  timeLabel: string;
  title: string;
}

export type ElderHomeCard =
  | {
      kind: "next";
      medicationName: string;
      dosageLabel: string;
      timeLabel: string;
    }
  | { kind: "finished" }
  | { kind: "empty" };

export interface ElderScheduleItem {
  id: string;
  kind: "medication" | "appointment";
  sortKey: number;
  timeLabel: string;
  title: string;
  detail: string | null;
  statusLabel: ElderSlotLabel | null;
}

export function ensureConsultaWord(title: string): string {
  const trimmed = title.trim();
  if (trimmed.toLocaleLowerCase("pt-BR").includes("consulta")) return trimmed;
  if (!trimmed) return "Consulta";
  return `Consulta · ${trimmed}`;
}

interface MedicationSlotDraft {
  medicationId: string;
  medicationName: string;
  dosageLabel: string;
  minutes: number;
  timeLabel: string;
  reminderSent: boolean;
}

function normalizeClockLabel(time: string): string | null {
  return parseClock(time)?.label ?? null;
}

function collectMedicationSlots(
  medications: ElderMedicationInput[],
): MedicationSlotDraft[] {
  const slots: MedicationSlotDraft[] = [];
  for (const medication of medications) {
    const reminded = new Set(
      medication.remindedTimes
        .map((time) => normalizeClockLabel(time))
        .filter((label): label is string => Boolean(label)),
    );
    for (const time of medication.times) {
      const clock = parseClock(time);
      if (!clock) continue;
      slots.push({
        medicationId: medication.medicationId,
        medicationName: medication.medicationName.trim(),
        dosageLabel: medication.dosageLabel.trim(),
        minutes: clock.minutes,
        timeLabel: clock.label,
        reminderSent: reminded.has(clock.label),
      });
    }
  }
  return slots;
}

export function labelMedicationSlot(input: {
  minutes: number;
  nowMinutes: number;
  reminderSent: boolean;
  isNext: boolean;
}): ElderSlotLabel {
  if (input.minutes <= input.nowMinutes || input.reminderSent) {
    return ELDER_SLOT_LABELS.already;
  }
  if (input.isNext) return ELDER_SLOT_LABELS.next;
  return ELDER_SLOT_LABELS.later;
}

function upcomingSlots(
  slots: MedicationSlotDraft[],
  nowMinutes: number,
): MedicationSlotDraft[] {
  return slots
    .filter((slot) => slot.minutes > nowMinutes && !slot.reminderSent)
    .sort(
      (a, b) =>
        a.minutes - b.minutes ||
        a.medicationName.localeCompare(b.medicationName, "pt-BR"),
    );
}

export function buildElderHomeCard(
  medications: ElderMedicationInput[],
  nowMinutes: number,
): ElderHomeCard {
  const slots = collectMedicationSlots(medications);
  if (slots.length === 0) return { kind: "empty" };
  const next = upcomingSlots(slots, nowMinutes)[0];
  if (!next) return { kind: "finished" };
  return {
    kind: "next",
    medicationName: next.medicationName,
    dosageLabel: next.dosageLabel,
    timeLabel: next.timeLabel,
  };
}

export function buildElderSchedule(input: {
  medications: ElderMedicationInput[];
  appointments: ElderAppointmentInput[];
  nowMinutes: number;
}): ElderScheduleItem[] {
  const slots = collectMedicationSlots(input.medications);
  const nextMinutes = upcomingSlots(slots, input.nowMinutes)[0]?.minutes ?? null;

  const medicationItems: ElderScheduleItem[] = slots.map((slot, index) => ({
    id: `med-${slot.medicationId}-${slot.timeLabel}-${index}`,
    kind: "medication",
    sortKey: slot.minutes,
    timeLabel: slot.timeLabel,
    title: slot.medicationName,
    detail: slot.dosageLabel || null,
    statusLabel: labelMedicationSlot({
      minutes: slot.minutes,
      nowMinutes: input.nowMinutes,
      reminderSent: slot.reminderSent,
      isNext: nextMinutes !== null && slot.minutes === nextMinutes,
    }),
  }));

  const appointmentItems: ElderScheduleItem[] = [];
  input.appointments.forEach((appointment, index) => {
    const clock = parseClock(appointment.timeLabel);
    if (!clock) return;
    appointmentItems.push({
      id: `appt-${clock.label}-${index}`,
      kind: "appointment",
      sortKey: clock.minutes,
      timeLabel: clock.label,
      title: ensureConsultaWord(appointment.title),
      detail: null,
      statusLabel: null,
    });
  });

  return [...medicationItems, ...appointmentItems].sort(
    (left, right) =>
      left.sortKey - right.sortKey ||
      left.title.localeCompare(right.title, "pt-BR"),
  );
}

/** Um horário só, e o texto do dia cita lembrete daquele remédio. Vários horários ficam no relógio. */
export function remindedTimesFromActivity(input: {
  medicationName: string;
  dosageLabel: string;
  times: string[];
  activityTitles: string[];
}): string[] {
  const clocks = input.times
    .map((time) => normalizeClockLabel(time))
    .filter((label): label is string => Boolean(label));
  if (clocks.length !== 1) return [];
  const needle = `${input.medicationName} ${input.dosageLabel}`
    .trim()
    .toLocaleLowerCase("pt-BR");
  if (!needle) return [];
  const onlyClock = clocks[0];
  if (!onlyClock) return [];
  const sent = input.activityTitles.some((title) => {
    const normalized = title.toLocaleLowerCase("pt-BR");
    return normalized.includes("lembrete") && normalized.includes(needle);
  });
  return sent ? [onlyClock] : [];
}

export function canOpenElderPreview(input: {
  hasSession: boolean;
  canViewRoutine: boolean;
}): boolean {
  return input.hasSession && input.canViewRoutine;
}

/** A prévia não grava. Só o aparelho vinculado registra o pedido. */
export function elderSosPersistsAlert(linkedDevice: boolean): boolean {
  return linkedDevice;
}
