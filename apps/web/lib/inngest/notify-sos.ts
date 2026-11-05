import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";
import { inngest, isInngestConfigured } from "@/lib/inngest/client";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { canViewLocation } from "@/modules/location/domain/can-view-location";
import { sendTransactionalEmail } from "@/modules/reminders/infrastructure/transactional-email";
import { shouldHoldOpenSosRepeat } from "@/modules/sos/domain/sos-repeat";
import {
  fetchPreviousOpenSosAlert,
  fetchSosAlertById,
} from "@/modules/sos/infrastructure/sos-alert-repo";
import { fetchSosEscalationConfig } from "@/modules/sos/infrastructure/sos-escalation-repo";
import type { SosEscalationEntryRow } from "@/modules/sos/infrastructure/sos-escalation-repo";
import { fetchNotificationAttemptsForAlert, insertSosNotificationAttempt } from "@/modules/sos/infrastructure/sos-notification-repo";

export const SOS_NOTIFY_EVENT = "sos/notify";

const SAO_PAULO = "America/Sao_Paulo";

function logNotifyFailure(alertId: string) {
  Sentry.captureMessage("sos_notify_failed", {
    level: "error",
    tags: { event: "sos_notify_failed" },
    extra: { alertId },
  });
}

function careLabel(value: string | null | undefined): string {
  const cleaned = (value ?? "").replace(/[\r\n]+/g, " ").trim();
  return cleaned.slice(0, 80) || "A pessoa cuidada";
}

function formatSaoPauloClock(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

async function readCareLabel(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("care_recipients")
    .select("display_name")
    .eq("id", careRecipientId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return careLabel(data?.display_name as string | undefined);
}

async function emailForEntry(
  supabase: SupabaseClient,
  entry: SosEscalationEntryRow,
): Promise<string | null> {
  if (entry.profileId) {
    const { data, error } = await supabase.auth.admin.getUserById(entry.profileId);
    const login = data?.user?.email?.trim();
    if (!error && login) return login;
  }
  if (!entry.memberId) return null;
  const { data, error } = await supabase
    .from("account_members")
    .select("contact_email")
    .eq("id", entry.memberId)
    .maybeSingle();
  if (error) return null;
  return (data?.contact_email as string | null)?.trim() || null;
}

function logZoneEmailFailure(careRecipientId: string) {
  Sentry.captureMessage("zone_exit", {
    level: "error",
    tags: { event: "zone_exit" },
    extra: { careRecipientId },
  });
}

function asAccountRole(value: string): AccountRole | null {
  const roles = Object.values(ACCOUNT_ROLES);
  return roles.find((role) => role === value) ?? null;
}

async function memberEmail(
  supabase: SupabaseClient,
  profileId: string | null,
  contactEmail: string | null,
): Promise<string | null> {
  if (profileId) {
    const { data, error } = await supabase.auth.admin.getUserById(profileId);
    const login = data?.user?.email?.trim();
    if (!error && login) return login;
  }
  return contactEmail?.trim() || null;
}

export async function deliverZoneExitEmails(input: {
  accountId: string;
  careRecipientId: string;
  label: string;
}): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("account_members")
    .select("profile_id, role, contact_email")
    .eq("account_id", input.accountId)
    .eq("status", "active");
  if (error) throw new Error(error.message);

  const recipients: string[] = [];
  for (const row of data ?? []) {
    const role = asAccountRole(row.role as string);
    if (!role || !canViewLocation(role)) continue;
    const to = await memberEmail(
      supabase,
      (row.profile_id as string | null) ?? null,
      (row.contact_email as string | null) ?? null,
    );
    if (to && !recipients.includes(to)) recipients.push(to);
  }

  await Promise.all(
    recipients.map(async (to) => {
      try {
        const result = await sendTransactionalEmail({
          to,
          subject: "Zelita: saiu da Casa",
          text: `${input.label} saiu da Casa. O detalhe está em Onde ele está.`,
        });
        if (!result.ok || result.dryRun) logZoneEmailFailure(input.careRecipientId);
      } catch {
        logZoneEmailFailure(input.careRecipientId);
      }
    }),
  );
}

export async function deliverSosEmails(
  alertId: string,
): Promise<{ skipped: boolean; reason?: string }> {
  const parsed = z.string().uuid().safeParse(alertId);
  if (!parsed.success) return { skipped: true, reason: "invalid_alert" };

  const supabase = createSupabaseServiceClient();
  const alert = await fetchSosAlertById(supabase, parsed.data);
  if (!alert) return { skipped: true, reason: "missing_alert" };

  const existing = await fetchNotificationAttemptsForAlert(supabase, alert.id);
  if (existing.length > 0) return { skipped: true, reason: "already_sent" };

  const previous = await fetchPreviousOpenSosAlert(supabase, {
    careRecipientId: alert.careRecipientId,
    beforeIso: alert.triggeredAt,
    exceptId: alert.id,
  });
  if (
    previous &&
    shouldHoldOpenSosRepeat({
      now: new Date(alert.triggeredAt),
      openAlertTriggeredAt: new Date(previous.triggeredAt),
    })
  ) {
    return { skipped: true, reason: "repeat_window" };
  }

  const config = await fetchSosEscalationConfig(supabase, alert.careRecipientId);
  const entries = config?.entries ?? [];
  const label = await readCareLabel(supabase, alert.careRecipientId);
  const clock = formatSaoPauloClock(alert.triggeredAt);
  const attemptedAt = new Date().toISOString();
  const text = `${label} pediu ajuda às ${clock}. O detalhe está em Pedidos de ajuda.`;

  await Promise.all(
    entries.map(async (entry) => {
      const to = await emailForEntry(supabase, entry);
      let status: "sent" | "failed" = "failed";
      if (to) {
        try {
          const result = await sendTransactionalEmail({
            to,
            subject: "Zelita: pedido de ajuda",
            text,
          });
          if (result.ok && !result.dryRun) status = "sent";
        } catch {
          status = "failed";
        }
      }
      if (status === "failed") logNotifyFailure(alert.id);
      await insertSosNotificationAttempt(supabase, {
        sosAlertId: alert.id,
        profileId: entry.profileId,
        displayName: entry.displayName,
        channel: "email",
        status,
        attemptedAt,
      });
    }),
  );

  return { skipped: false };
}

export async function requestSosNotify(alertId: string): Promise<void> {
  if (!isInngestConfigured()) {
    await deliverSosEmails(alertId);
    return;
  }
  try {
    await inngest.send({ name: SOS_NOTIFY_EVENT, data: { alertId } });
  } catch {
    logNotifyFailure(alertId);
    await deliverSosEmails(alertId);
  }
}

export const notifySos = inngest.createFunction(
  {
    id: "sos-notify",
    name: "Avisar pedido de ajuda",
    triggers: [{ event: SOS_NOTIFY_EVENT }],
  },
  async ({ event, step }) => {
    const alertId = z.string().uuid().safeParse(
      (event.data as { alertId?: unknown } | null)?.alertId,
    );
    if (!alertId.success) return { skipped: true, reason: "invalid_alert" };
    return step.run("deliver", () => deliverSosEmails(alertId.data));
  },
);
