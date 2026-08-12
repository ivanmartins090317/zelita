import {
  assertSafeReminderLanguage,
  decideReminderSend,
  isInsideDnd,
  REMINDER_DECISIONS,
  reminderSentCopy,
} from "./domain/eligibility";
import { scheduleMedicationReminders } from "./application/schedule-reminders";
import {
  createWhatsAppPort,
  isWhatsAppConfigured,
} from "./infrastructure/whatsapp-port";

export const remindersModule = {
  id: "reminders",
} as const;

export {
  assertSafeReminderLanguage,
  decideReminderSend,
  isInsideDnd,
  REMINDER_DECISIONS,
  reminderSentCopy,
  scheduleMedicationReminders,
  createWhatsAppPort,
  isWhatsAppConfigured,
};
