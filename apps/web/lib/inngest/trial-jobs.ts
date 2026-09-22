import * as Sentry from "@sentry/nextjs";

import { pauseUnpaidAccount } from "@/modules/accounts/application/pause-unpaid-account";
import { ACCOUNT_STATUSES, type AccountStatus } from "@/modules/accounts/domain/roles";
import { inngest } from "@/lib/inngest/client";
import {
  shouldPauseUnpaidTrial,
  shouldSendTrialEndingWarning,
} from "@/modules/billing/domain/trial-jobs";
import { findAdminEmail } from "@/modules/reminders/infrastructure/reminder-job-store";
import { sendTransactionalEmail } from "@/modules/reminders/infrastructure/transactional-email";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

interface TrialAccountRow {
  id: string;
  status: AccountStatus;
  trial_ends_at: string | null;
  billing_customer_id: string | null;
}

export const warnTrialEnding = inngest.createFunction(
  {
    id: "billing-trial-ending",
    name: "Avisar fim de trial (−5 dias)",
    triggers: [{ cron: "TZ=America/Sao_Paulo 0 9 * * *" }],
  },
  async ({ step }) => {
    return step.run("warn-trials", async () => {
      const now = new Date();
      const supabase = createSupabaseServiceClient();
      const accounts = await listTrialAccounts(supabase);
      let warned = 0;

      for (const account of accounts) {
        if (!account.trial_ends_at) continue;
        const ends = new Date(account.trial_ends_at);
        if (!shouldSendTrialEndingWarning(ends, now)) continue;
        if (account.status !== ACCOUNT_STATUSES.active) continue;

        const adminEmail = await findAdminEmail(supabase, account.id);
        if (!adminEmail) continue;

        const email = await sendTransactionalEmail({
          to: adminEmail,
          subject: "Zelita: seu período de teste acaba em 5 dias",
          text: "O trial da Zelita termina em 5 dias. Sem ação, a conta pausa e os lembretes param. Não há cobrança automática.",
        });
        if (!email.ok) {
          Sentry.captureException(new Error("trial_email_failed"), {
            extra: { event: "billing/trial_ending", accountId: account.id },
          });
        }
        warned += 1;
      }

      return { warned };
    });
  },
);

export const pauseUnconfirmedTrials = inngest.createFunction(
  {
    id: "billing-pause-if-unconfirmed",
    name: "Pausar trial vencido sem cobrança",
    triggers: [{ cron: "TZ=America/Sao_Paulo 15 0 * * *" }],
  },
  async ({ step }) => {
    return step.run("pause-ended-trials", async () => {
      const now = new Date();
      const supabase = createSupabaseServiceClient();
      const accounts = await listTrialAccounts(supabase);
      let paused = 0;

      for (const account of accounts) {
        const shouldPause = shouldPauseUnpaidTrial({
          trialEndsAt: account.trial_ends_at
            ? new Date(account.trial_ends_at)
            : null,
          accountStatus: account.status,
          hasPaidPlan: Boolean(account.billing_customer_id),
          now,
        });
        if (!shouldPause) continue;

        const result = await pauseUnpaidAccount(supabase, account.id);
        if (!result.ok) {
          Sentry.captureException(new Error("trial_pause_failed"), {
            extra: { event: "billing/pause_if_unconfirmed", accountId: account.id },
          });
          continue;
        }

        const adminEmail = await findAdminEmail(supabase, account.id);
        if (adminEmail) {
          await sendTransactionalEmail({
            to: adminEmail,
            subject: "Zelita: conta pausada ao fim do trial",
            text: "O trial terminou e a conta foi pausada. Os dados permanecem. Os lembretes param. Não houve cobrança.",
          });
        }
        paused += 1;
      }

      return { paused };
    });
  },
);

async function listTrialAccounts(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
): Promise<TrialAccountRow[]> {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, status, trial_ends_at, billing_customer_id")
    .not("trial_ends_at", "is", null);

  if (error) {
    throw new Error(`Falha ao listar trials: ${error.message}.`);
  }
  return (data ?? []) as TrialAccountRow[];
}
