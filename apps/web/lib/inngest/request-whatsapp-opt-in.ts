import { inngest } from "@/lib/inngest/client";
import { assertSafeReminderLanguage } from "@/modules/reminders/domain/eligibility";
import { createWhatsAppPort } from "@/modules/reminders/infrastructure/whatsapp-port";
import {
  insertMedicationEvent,
  loadReminderRecipient,
} from "@/modules/reminders/infrastructure/reminder-job-store";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const requestWhatsAppOptIn = inngest.createFunction(
  {
    id: "wa-opt-in-request",
    name: "Pedir opt-in WhatsApp",
    triggers: [{ event: "wa/opt_in.request" }],
  },
  async ({ event, step }) => {
    const { careRecipientId } = event.data as { careRecipientId: string };

    return step.run("send-opt-in", async () => {
      const supabase = createSupabaseServiceClient();
      const recipient = await loadReminderRecipient(supabase, careRecipientId);

      if (!recipient || recipient.waOptInAt) {
        return { skipped: true };
      }

      const preview = `Olá, ${recipient.displayName}! Aqui é a Zelita. A sua família pediu para eu lembrar o senhor(a) dos remédios. Posso enviar essas mensagens? Responda SIM para autorizar.`;
      assertSafeReminderLanguage(preview);

      const send = await createWhatsAppPort().sendTemplate({
        toE164ish: recipient.whatsapp,
        kind: "opt_in_request",
        bodyVariables: [recipient.displayName],
      });

      await insertMedicationEvent(supabase, {
        careRecipientId,
        type: "wa_opt_in_requested",
        channel: "whatsapp",
        payload: {
          dryRun: send.dryRun,
          providerMessageId: send.providerMessageId,
        },
      });

      return { send };
    });
  },
);
