import { checkPackRefills } from "./check-pack-refills";
import { requestWhatsAppOptIn } from "./request-whatsapp-opt-in";
import { scheduleDailyReminders } from "./schedule-daily-reminders";
import { sendMedicationReminder } from "./send-medication-reminder";
import { notifySos } from "./notify-sos";
import { pauseUnconfirmedTrials, warnTrialEnding } from "./trial-jobs";

export const reminderFunctions = [
  sendMedicationReminder,
  requestWhatsAppOptIn,
  scheduleDailyReminders,
  checkPackRefills,
  warnTrialEnding,
  pauseUnconfirmedTrials,
  notifySos,
];
