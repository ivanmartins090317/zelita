import { inngest, isInngestConfigured } from "@/lib/inngest/client";

export interface ScheduleRemindersInput {
  medicationId: string;
  packId: string;
  careRecipientId: string;
  times: string[];
  medicationLabel: string;
}

/**
 * Agenda lembretes. Sem Inngest configurado: registra evento local de schedule dry-run.
 */
export async function scheduleMedicationReminders(
  input: ScheduleRemindersInput,
): Promise<{ ok: boolean; message: string }> {
  await inngest.send({
    name: "wa/opt_in.request",
    data: { careRecipientId: input.careRecipientId },
  }).catch(() => undefined);

  if (!isInngestConfigured()) {
    return {
      ok: true,
      message:
        "Horários salvos. Inngest não configurado — lembretes em modo seco até INNGEST_EVENT_KEY.",
    };
  }

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  for (const time of input.times) {
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(tomorrow);
    scheduledAt.setUTCHours(hours, minutes, 0, 0);

    await inngest.send({
      name: "med/reminder.send",
      data: {
        careRecipientId: input.careRecipientId,
        packId: input.packId,
        medicationId: input.medicationId,
        medicationLabel: input.medicationLabel,
        scheduledAt: scheduledAt.toISOString(),
      },
    });
  }

  return {
    ok: true,
    message: "Lembretes agendados no Inngest (ainda exigem opt-in para enviar).",
  };
}
