import * as Sentry from "@sentry/nextjs";

import { inngest } from "@/lib/inngest/client";
import {
  classifyRefillAlert,
  REFILL_ALERT_KINDS,
  refillEventType,
} from "@/modules/reminders/domain/refill-alert-kind";
import { dateKeyInZone } from "@/modules/reminders/domain/zoned-time";
import {
  hasRefillEventToday,
  listActiveRefillPacks,
} from "@/modules/reminders/infrastructure/active-pack-slots";
import {
  findAdminEmail,
  insertMedicationEvent,
} from "@/modules/reminders/infrastructure/reminder-job-store";
import { sendTransactionalEmail } from "@/modules/reminders/infrastructure/transactional-email";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const checkPackRefills = inngest.createFunction(
  {
    id: "med-pack-refill-check",
    name: "Avisar cartela acabando",
    triggers: [{ cron: "TZ=America/Sao_Paulo 0 9 * * *" }],
  },
  async ({ step }) => {
    return step.run("warn-refills", async () => {
      const now = new Date();
      const supabase = createSupabaseServiceClient();
      const packs = await listActiveRefillPacks(supabase, now);
      const dateKey = dateKeyInZone(now);
      let warned = 0;

      for (const pack of packs) {
        const kind = classifyRefillAlert(pack.daysRemaining, pack.refillAlertDays);
        const eventType = refillEventType(kind);
        if (!eventType) continue;

        if (await hasRefillEventToday(supabase, pack.packId, eventType, dateKey)) {
          continue;
        }

        await insertMedicationEvent(supabase, {
          packId: pack.packId,
          careRecipientId: pack.careRecipientId,
          type: eventType,
          channel: "email",
          payload: {
            kind,
            daysRemaining: pack.daysRemaining,
            note: "aviso_nao_implica_tomada",
          },
        });

        const adminEmail = await findAdminEmail(supabase, pack.accountId);
        const subject =
          kind === REFILL_ALERT_KINDS.lastDay
            ? "Zelita: último dia da cartela"
            : "Zelita: cartela acabando";
        const text =
          kind === REFILL_ALERT_KINDS.lastDay
            ? `A cartela de ${pack.medicationName} ${pack.dosageLabel} está no último dia previsto. Verifique com o idoso ou cuidador e anote a nova caixa. Lembrete enviado não prova tomada.`
            : `A cartela de ${pack.medicationName} ${pack.dosageLabel} deve acabar em ${pack.daysRemaining} dia(s). Compre outra caixa. Isso não afirma que o remédio foi tomado.`;

        if (adminEmail) {
          const email = await sendTransactionalEmail({
            to: adminEmail,
            subject,
            text,
          });
          if (!email.ok) {
            Sentry.captureException(new Error("refill_email_failed"), {
              extra: { event: "med/pack.refill_check", packId: pack.packId },
            });
          }
        }

        warned += 1;
      }

      return { warned };
    });
  },
);
