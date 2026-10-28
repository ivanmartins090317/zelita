import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

import { familyContent } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts";
import { readCareChannelForDeviceLink } from "@/modules/care-recipients";
import {
  DEVICE_LINK_CHANNELS,
  canManageElderDevice,
  deviceLinkExpiresAt,
  deviceLinkFirstName,
  deviceLinkHourStart,
  formatPanelDateTime,
  interpretWhatsappSend,
  isHostedWhatsappRuntime,
  linkIssueBlock,
  LINK_ISSUE_BLOCKS,
  REMOTE_SEND_BLOCKS,
  remoteSendBlock,
  type DeviceLinkChannel,
} from "@/modules/elder-access/domain/device-link";
import {
  createDeviceToken,
  hashDeviceSecret,
} from "@/modules/elder-access/domain/device-secret";
import {
  countDeviceLinksSince,
  createFamilyDeviceClient,
  insertDeviceLink,
  invalidateOpenDeviceLinks,
  listActiveDeviceSummaries,
} from "@/modules/elder-access/infrastructure/device-link-store";
import {
  createWhatsAppPort,
} from "@/modules/reminders";

export interface IssuedDeviceLink {
  ok: boolean;
  message: string;
  url?: string;
  expiresLabel?: string;
}

function logLink(
  event: string,
  input: {
    accountId: string;
    careRecipientId: string;
    channel?: string;
    reason?: string;
  },
) {
  Sentry.captureMessage(event, {
    level: event === "elder_link_rejected" ? "warning" : "info",
    tags: {
      event,
      ...(input.channel ? { channel: input.channel } : {}),
      ...(input.reason ? { reason: input.reason } : {}),
    },
    extra: {
      accountId: input.accountId,
      careRecipientId: input.careRecipientId,
    },
  });
}

async function resolvePublicBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

function withWhen(template: string, when: string): string {
  return template.replace("{quando}", when);
}

export async function issueDeviceLink(
  channel: DeviceLinkChannel,
): Promise<IssuedDeviceLink> {
  const copy = familyContent.install;
  const ctx = await getFamilyContext();
  if (
    !ctx.accountId ||
    !ctx.userId ||
    !ctx.careRecipientId ||
    !canManageElderDevice(ctx.role)
  ) {
    return { ok: false, message: familyContent.ajustes.errors.accessDenied };
  }

  const accountId = ctx.accountId;
  const careRecipientId = ctx.careRecipientId;
  const now = new Date();
  const supabase = await createFamilyDeviceClient();
  const active = await listActiveDeviceSummaries(
    supabase,
    accountId,
    careRecipientId,
  );
  const linksInLastHour = await countDeviceLinksSince(
    supabase,
    accountId,
    careRecipientId,
    deviceLinkHourStart(now).toISOString(),
  );
  const block = linkIssueBlock({
    hasActiveDevice: active.length > 0,
    linksInLastHour,
  });

  if (block === LINK_ISSUE_BLOCKS.activeDevice) {
    logLink("elder_link_rejected", {
      accountId,
      careRecipientId,
      channel,
      reason: block,
    });
    return { ok: false, message: copy.activeDevice };
  }
  if (block === LINK_ISSUE_BLOCKS.hourlyLimit) {
    logLink("elder_link_rejected", {
      accountId,
      careRecipientId,
      channel,
      reason: block,
    });
    return { ok: false, message: copy.hourlyLimit };
  }

  let remote: Awaited<ReturnType<typeof readCareChannelForDeviceLink>> = null;
  if (channel === DEVICE_LINK_CHANNELS.whatsapp) {
    remote = await readCareChannelForDeviceLink();
    const remoteBlock = remoteSendBlock({
      whatsapp: remote?.whatsapp,
      optedIn: Boolean(remote?.optedIn),
    });
    if (remoteBlock === REMOTE_SEND_BLOCKS.missingWhatsapp) {
      logLink("elder_link_rejected", {
        accountId,
        careRecipientId,
        channel,
        reason: remoteBlock,
      });
      return { ok: false, message: copy.missingWhatsapp };
    }
    if (remoteBlock === REMOTE_SEND_BLOCKS.missingOptIn || !remote?.whatsapp) {
      logLink("elder_link_rejected", {
        accountId,
        careRecipientId,
        channel,
        reason: REMOTE_SEND_BLOCKS.missingOptIn,
      });
      return { ok: false, message: copy.missingOptIn };
    }
  }

  const token = createDeviceToken();
  const expiresAt = deviceLinkExpiresAt(now);
  await invalidateOpenDeviceLinks(
    supabase,
    accountId,
    careRecipientId,
    now.toISOString(),
  );
  await insertDeviceLink(supabase, {
    accountId,
    careRecipientId,
    tokenHash: hashDeviceSecret(token),
    expiresAtIso: expiresAt.toISOString(),
    createdBy: ctx.userId,
    channel,
  });
  logLink("elder_link_created", { accountId, careRecipientId, channel });

  const url = `${await resolvePublicBaseUrl()}/ativar/${token}`;
  const expiresLabel = formatPanelDateTime(expiresAt);

  if (channel === DEVICE_LINK_CHANNELS.inPerson) {
    return {
      ok: true,
      message: withWhen(copy.bigLinkLead, expiresLabel),
      url,
      expiresLabel,
    };
  }

  const whatsapp = remote?.whatsapp;
  if (!whatsapp) {
    return { ok: false, message: copy.missingWhatsapp, url, expiresLabel };
  }

  let outcome: ReturnType<typeof interpretWhatsappSend> = "failed";
  try {
    const sent = await createWhatsAppPort().sendTemplate({
      toE164ish: whatsapp,
      kind: "device_link",
      bodyVariables: [deviceLinkFirstName(remote?.displayName), url],
    });
    outcome = interpretWhatsappSend({
      hosted: isHostedWhatsappRuntime(process.env.VERCEL),
      providerOk: sent.ok,
      dryRun: sent.dryRun,
    });
  } catch {
    outcome = "failed";
  }

  if (outcome === "failed") {
    logLink("elder_link_rejected", {
      accountId,
      careRecipientId,
      channel,
      reason: "send_failed",
    });
    return {
      ok: false,
      message: withWhen(copy.sendFailed, expiresLabel),
      url,
      expiresLabel,
    };
  }

  if (outcome === "sent") {
    logLink("elder_link_sent", { accountId, careRecipientId, channel });
  }

  return {
    ok: true,
    message: withWhen(outcome === "dry_run" ? copy.dryRun : copy.sent, expiresLabel),
    url,
    expiresLabel,
  };
}
