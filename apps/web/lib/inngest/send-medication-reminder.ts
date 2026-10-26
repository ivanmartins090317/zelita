import * as Sentry from "@sentry/nextjs";

import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { inngest } from "@/lib/inngest/client";
import { DND_ACTIONS, resolveDndAction } from "@/modules/reminders/domain/dnd-defer";
import {
  assertSafeReminderLanguage,
  decideReminderSend,
  REMINDER_DECISIONS,
  reminderSentCopy,
} from "@/modules/reminders/domain/eligibility";
import { createWhatsAppPort } from "@/modules/reminders/infrastructure/whatsapp-port";
import { clockMatchesSchedule } from "@/modules/reminders/domain/zoned-time";
import {
  hasReminderOccurrence,
  insertMedicationEvent,
  loadPackScheduleTimes,
  loadReminderRecipient,
  medicationPackExists,
} from "@/modules/reminders/infrastructure/reminder-job-store";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export interface ReminderSendEvent {
  careRecipientId: string;
  packId: string;
  medicationLabel: string;
  scheduledAt: string;
  nextSlotAt?: string;
}

export const sendMedicationReminder = inngest.createFunction(
  {
    id: "med-reminder-send",
    name: "Enviar lembrete de remédio",
    triggers: [{ event: "med/reminder.send" }],
  },
  async ({ event, step }) => {
    const data = event.data as ReminderSendEvent;

    const prepared = await step.run("evaluate", async () =>
      evaluateReminder(data),
    );

    if (prepared.kind === "skip") {
      return { skipped: true, reason: prepared.reason };
    }

    if (prepared.kind === "defer") {
      await step.sleepUntil("wait-dnd-end", new Date(prepared.sendAt));
      return step.run("send-after-dnd", async () =>
        evaluateReminder(data, { forceSendIfEligible: true }),
      );
    }

    return { skipped: false, send: prepared.send };
  },
);

interface EvaluateSkip {
  kind: "skip";
  reason: string;
}

interface EvaluateDefer {
  kind: "defer";
  sendAt: string;
}

interface EvaluateSend {
  kind: "send";
  send: { dryRun: boolean; ok: boolean };
}

async function evaluateReminder(
  data: ReminderSendEvent,
  options?: { forceSendIfEligible?: boolean },
): Promise<EvaluateSkip | EvaluateDefer | EvaluateSend> {
  const supabase = createSupabaseServiceClient();

  if (await hasReminderOccurrence(supabase, data.packId, data.scheduledAt)) {
    return { kind: "skip", reason: "already_processed" };
  }

  if (!(await medicationPackExists(supabase, data.packId))) {
    return { kind: "skip", reason: "pack_missing" };
  }

  const scheduleTimes = await loadPackScheduleTimes(supabase, data.packId);
  if (
    !scheduleTimes ||
    !clockMatchesSchedule(new Date(data.scheduledAt), scheduleTimes)
  ) {
    return { kind: "skip", reason: "schedule_changed" };
  }

  const recipient = await loadReminderRecipient(supabase, data.careRecipientId);
  if (!recipient) {
    return { kind: "skip", reason: "care_recipient_missing" };
  }

  const scheduledAt = new Date(data.scheduledAt);
  const decision = decideReminderSend({
    hasWhatsAppOptIn: Boolean(recipient.waOptInAt),
    accountPaused: recipient.accountStatus
      ? isAccountPaused(recipient.accountStatus)
      : false,
    scheduledAt,
    dnd: { start: recipient.dndStart, end: recipient.dndEnd },
  });

  if (decision === REMINDER_DECISIONS.defer_dnd && !options?.forceSendIfEligible) {
    const dnd = resolveDndAction({
      scheduledAt,
      dnd: { start: recipient.dndStart, end: recipient.dndEnd },
      nextSlotAt: data.nextSlotAt ? new Date(data.nextSlotAt) : null,
    });
    if (dnd.action === DND_ACTIONS.defer) {
      return { kind: "defer", sendAt: dnd.sendAt.toISOString() };
    }
    const skipReason =
      dnd.action === DND_ACTIONS.skip ? dnd.reason : "dnd_unresolved";
    await insertMedicationEvent(supabase, {
      packId: data.packId,
      careRecipientId: data.careRecipientId,
      type: "reminder_skipped",
      channel: "whatsapp",
      payload: { reason: skipReason, scheduledAt: data.scheduledAt },
    });
    return { kind: "skip", reason: skipReason };
  }

  if (decision !== REMINDER_DECISIONS.send && !options?.forceSendIfEligible) {
    await insertMedicationEvent(supabase, {
      packId: data.packId,
      careRecipientId: data.careRecipientId,
      type: "reminder_skipped",
      channel: "whatsapp",
      payload: { reason: decision, scheduledAt: data.scheduledAt },
    });
    return { kind: "skip", reason: decision };
  }

  if (
    options?.forceSendIfEligible &&
    decision !== REMINDER_DECISIONS.send &&
    decision !== REMINDER_DECISIONS.defer_dnd
  ) {
    await insertMedicationEvent(supabase, {
      packId: data.packId,
      careRecipientId: data.careRecipientId,
      type: "reminder_skipped",
      channel: "whatsapp",
      payload: { reason: decision, scheduledAt: data.scheduledAt },
    });
    return { kind: "skip", reason: decision };
  }

  const body = reminderSentCopy(recipient.displayName, data.medicationLabel);
  assertSafeReminderLanguage(body);

  const send = await createWhatsAppPort().sendTemplate({
    toE164ish: recipient.whatsapp,
    kind: "reminder",
    bodyVariables: [recipient.displayName, data.medicationLabel],
  });

  if (!send.ok) {
    Sentry.captureException(new Error("whatsapp_reminder_failed"), {
      extra: {
        careRecipientId: data.careRecipientId,
        packId: data.packId,
        event: "med/reminder.send",
      },
    });
  }

  await insertMedicationEvent(supabase, {
    packId: data.packId,
    careRecipientId: data.careRecipientId,
    type: "reminder_sent",
    channel: "whatsapp",
    payload: {
      dryRun: send.dryRun,
      providerMessageId: send.providerMessageId,
      scheduledAt: data.scheduledAt,
      note: "reminder_sent_does_not_mean_taken",
    },
  });

  return { kind: "send", send: { dryRun: send.dryRun, ok: send.ok } };
}
