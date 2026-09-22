import * as Sentry from "@sentry/nextjs";

import { inngest } from "@/lib/inngest/client";
import { listActiveReminderSlots } from "@/modules/reminders/infrastructure/active-pack-slots";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const scheduleDailyReminders = inngest.createFunction(
  {
    id: "med-reminder-schedule-daily",
    name: "Materializar lembretes do dia (Brasília)",
    triggers: [{ cron: "TZ=America/Sao_Paulo 10 0 * * *" }],
  },
  async ({ step }) => {
    return step.run("fan-out-today", async () => {
      const supabase = createSupabaseServiceClient();
      const slots = await listActiveReminderSlots(supabase, new Date());
      let queued = 0;

      for (const item of slots) {
        try {
          await inngest.send({
            name: "med/reminder.send",
            data: {
              careRecipientId: item.careRecipientId,
              packId: item.packId,
              medicationId: item.medicationId,
              medicationLabel: item.medicationLabel,
              scheduledAt: item.slot.scheduledAt.toISOString(),
              nextSlotAt: item.nextSlotAt,
            },
            ts: item.slot.scheduledAt.getTime(),
          });
          queued += 1;
        } catch (error) {
          Sentry.captureException(error, {
            extra: { event: "med/reminder.schedule", packId: item.packId },
          });
        }
      }

      return { queued };
    });
  },
);
