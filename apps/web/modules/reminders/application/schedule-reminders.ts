import { inngest, isInngestConfigured } from "@/lib/inngest/client";
import { remainingSlotsToday } from "@/modules/reminders/domain/zoned-time";

export interface ScheduleRemindersInput {
  medicationId: string;
  packId: string;
  careRecipientId: string;
  times: string[];
  medicationLabel: string;
  now?: Date;
}

/**
 * Pede opt-in e agenda o restante de hoje em Brasília.
 * A série dos próximos dias vem do cron diário.
 */
export async function scheduleMedicationReminders(
  input: ScheduleRemindersInput,
): Promise<{ ok: boolean; message: string }> {
  const now = input.now ?? new Date();
  const optInError = await sendQuiet({
    name: "wa/opt_in.request",
    data: { careRecipientId: input.careRecipientId },
  });

  const remaining = remainingSlotsToday(input.times, now);
  const slotErrors: string[] = [];

  for (const slot of remaining) {
    const error = await sendQuiet({
      name: "med/reminder.send",
      data: {
        careRecipientId: input.careRecipientId,
        packId: input.packId,
        medicationId: input.medicationId,
        medicationLabel: input.medicationLabel,
        scheduledAt: slot.scheduledAt.toISOString(),
      },
      ts: slot.scheduledAt.getTime(),
    });
    if (error) slotErrors.push(error);
  }

  if (!isInngestConfigured()) {
    return {
      ok: true,
      message:
        "Horários salvos. Inngest não configurado — lembretes em modo seco até INNGEST_EVENT_KEY.",
    };
  }

  if (optInError || slotErrors.length > 0) {
    return {
      ok: true,
      message: `Horários salvos. Falha ao agendar no Inngest (${optInError ?? slotErrors[0]}). O painel segue; confira a chave e o sync.`,
    };
  }

  return {
    ok: true,
    message:
      remaining.length > 0
        ? "Lembretes de hoje agendados (ainda exigem opt-in). A série diária segue no fuso de Brasília."
        : "Horários salvos. Os lembretes de amanhã em diante saem no horário de Brasília, após o opt-in.",
  };
}

async function sendQuiet(event: {
  name: string;
  data: Record<string, string>;
  ts?: number;
}): Promise<string | null> {
  try {
    await inngest.send(event);
    return null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : "Falha ao enviar evento Inngest.";
  }
}
