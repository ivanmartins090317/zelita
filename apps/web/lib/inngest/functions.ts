import { inngest } from "@/lib/inngest/client";
import {
  assertSafeReminderLanguage,
  decideReminderSend,
  REMINDER_DECISIONS,
  reminderSentCopy,
} from "@/modules/reminders/domain/eligibility";
import { createWhatsAppPort } from "@/modules/reminders/infrastructure/whatsapp-port";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  isAccountPaused,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";

interface ReminderSendEvent {
  careRecipientId: string;
  packId: string;
  medicationLabel: string;
  scheduledAt: string;
}

export const sendMedicationReminder = inngest.createFunction(
  {
    id: "med-reminder-send",
    name: "Enviar lembrete de remédio",
    triggers: [{ event: "med/reminder.send" }],
  },
  async ({ event, step }) => {
    const {
      careRecipientId,
      packId,
      medicationLabel,
      scheduledAt,
    } = event.data as ReminderSendEvent;

    return step.run("evaluate-and-send", async () => {
      const supabase = createSupabaseServiceClient();

      const { data: recipient } = await supabase
        .from("care_recipients")
        .select(
          "id, display_name, whatsapp, dnd_start, dnd_end, wa_opt_in_at, account_id, accounts(status)",
        )
        .eq("id", careRecipientId)
        .single();

      if (!recipient) {
        return { skipped: true, reason: "care_recipient_missing" };
      }

      const accountStatus = (
        Array.isArray(recipient.accounts)
          ? recipient.accounts[0]
          : recipient.accounts
      ) as { status?: AccountStatus } | null;

      const decision = decideReminderSend({
        hasWhatsAppOptIn: Boolean(recipient.wa_opt_in_at),
        accountPaused: accountStatus?.status
          ? isAccountPaused(accountStatus.status)
          : false,
        scheduledAt: new Date(scheduledAt),
        dnd: {
          start: recipient.dnd_start
            ? String(recipient.dnd_start).slice(0, 5)
            : null,
          end: recipient.dnd_end ? String(recipient.dnd_end).slice(0, 5) : null,
        },
      });

      if (decision !== REMINDER_DECISIONS.send) {
        await supabase.from("medication_events").insert({
          pack_id: packId,
          care_recipient_id: careRecipientId,
          type: "reminder_skipped",
          channel: "whatsapp",
          payload: { reason: decision, scheduledAt },
        });
        return { skipped: true, reason: decision };
      }

      const body = reminderSentCopy(recipient.display_name, medicationLabel);
      assertSafeReminderLanguage(body);

      const wa = createWhatsAppPort();
      const send = await wa.sendText({
        toE164ish: recipient.whatsapp ?? "",
        body,
        kind: "reminder",
      });

      await supabase.from("medication_events").insert({
        pack_id: packId,
        care_recipient_id: careRecipientId,
        type: "reminder_sent",
        channel: "whatsapp",
        payload: {
          dryRun: send.dryRun,
          providerMessageId: send.providerMessageId,
          scheduledAt,
          note: "reminder_sent_does_not_mean_taken",
        },
      });

      return { skipped: false, send };
    });
  },
);

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
      const { data: recipient } = await supabase
        .from("care_recipients")
        .select("display_name, whatsapp, wa_opt_in_at")
        .eq("id", careRecipientId)
        .single();

      if (!recipient || recipient.wa_opt_in_at) {
        return { skipped: true };
      }

      const body = `Olá, ${recipient.display_name}! Aqui é a Zelita. A sua família pediu para eu lembrar o senhor(a) dos remédios. Posso enviar essas mensagens? Responda SIM para autorizar.`;
      assertSafeReminderLanguage(body);

      const wa = createWhatsAppPort();
      const send = await wa.sendText({
        toE164ish: recipient.whatsapp ?? "",
        body,
        kind: "opt_in_request",
      });

      await supabase.from("medication_events").insert({
        care_recipient_id: careRecipientId,
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

export const reminderFunctions = [sendMedicationReminder, requestWhatsAppOptIn];
