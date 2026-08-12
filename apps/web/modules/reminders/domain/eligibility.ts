/**
 * Elegibilidade de lembrete: opt-in, DND, conta pausada.
 * Evento reminder_sent nunca implica tomada.
 */

export const REMINDER_DECISIONS = {
  send: "send",
  skip_no_opt_in: "skip_no_opt_in",
  skip_account_paused: "skip_account_paused",
  defer_dnd: "defer_dnd",
} as const;

export type ReminderDecision =
  (typeof REMINDER_DECISIONS)[keyof typeof REMINDER_DECISIONS];

export interface DndWindow {
  /** "HH:MM" 24h */
  start: string | null;
  end: string | null;
}

export interface ReminderEligibilityInput {
  hasWhatsAppOptIn: boolean;
  accountPaused: boolean;
  scheduledAt: Date;
  dnd: DndWindow;
}

function parseHm(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(":").map(Number);
  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    throw new Error(
      `Horário DND inválido "${value}". Use HH:MM (ex.: 07:00).`,
    );
  }
  return { hours: h, minutes: m };
}

function minutesSinceMidnight(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

/**
 * Janela "não incomodar": se start < end, intervalo normal (ex. 22→07 atravessa meia-noite).
 * Dentro da janela = não enviar agora.
 */
export function isInsideDnd(at: Date, dnd: DndWindow): boolean {
  if (!dnd.start || !dnd.end) return false;
  const start = parseHm(dnd.start);
  const end = parseHm(dnd.end);
  const startMin = start.hours * 60 + start.minutes;
  const endMin = end.hours * 60 + end.minutes;
  const nowMin = minutesSinceMidnight(at);

  if (startMin === endMin) return false;

  if (startMin < endMin) {
    return nowMin >= startMin && nowMin < endMin;
  }
  // Atravessa meia-noite: ex. 22:00 → 07:00
  return nowMin >= startMin || nowMin < endMin;
}

export function decideReminderSend(
  input: ReminderEligibilityInput,
): ReminderDecision {
  if (input.accountPaused) return REMINDER_DECISIONS.skip_account_paused;
  if (!input.hasWhatsAppOptIn) return REMINDER_DECISIONS.skip_no_opt_in;
  if (isInsideDnd(input.scheduledAt, input.dnd)) {
    return REMINDER_DECISIONS.defer_dnd;
  }
  return REMINDER_DECISIONS.send;
}

/** Copy segura: nunca afirmar tomada a partir de lembrete. */
export function reminderSentCopy(displayName: string, medicationLabel: string): string {
  return `Olá, ${displayName}. Está na hora de tomar ${medicationLabel}. Qualquer coisa é só chamar a família. — Zelita`;
}

export const FORBIDDEN_TAKEN_PHRASES = [
  "o idoso tomou",
  "tomou o medicamento",
  "medicação tomada",
] as const;

export function assertSafeReminderLanguage(text: string): void {
  const lower = text.toLowerCase();
  for (const phrase of FORBIDDEN_TAKEN_PHRASES) {
    if (lower.includes(phrase)) {
      throw new Error(
        `Copy proibida ("${phrase}"): lembrete enviado não implica tomada. Use "lembrete enviado".`,
      );
    }
  }
}
