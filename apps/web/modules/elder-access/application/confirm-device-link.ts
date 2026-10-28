import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

import {
  canConfirmDeviceLink,
  classifyDeviceLabel,
  isDeviceLinkOpen,
  isDeviceLinkTokenShape,
} from "@/modules/elder-access/domain/device-link";
import {
  createDeviceToken,
  deviceSecretsMatch,
  hashDeviceSecret,
} from "@/modules/elder-access/domain/device-secret";
import { writeElderDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import {
  careRecipientHasActiveDevice,
  consumeDeviceLink,
  findDeviceLinkByHash,
  insertBoundDevice,
} from "@/modules/elder-access/infrastructure/device-link-store";

export async function inspectDeviceLink(token: string): Promise<"open" | "closed"> {
  if (!isDeviceLinkTokenShape(token)) return "closed";
  try {
    const hash = hashDeviceSecret(token);
    const link = await findDeviceLinkByHash(hash);
    if (!link || !deviceSecretsMatch(hash, link.tokenHash)) return "closed";
    const open = isDeviceLinkOpen({
      usedAt: link.usedAt ? new Date(link.usedAt) : null,
      expiresAt: new Date(link.expiresAt),
      now: new Date(),
    });
    const hasActiveDevice = await careRecipientHasActiveDevice(
      link.careRecipientId,
      link.accountId,
    );
    return canConfirmDeviceLink({ linkOpen: open, hasActiveDevice })
      ? "open"
      : "closed";
  } catch {
    return "closed";
  }
}

export async function confirmElderDevice(
  token: string,
): Promise<{ ok: true } | { ok: false }> {
  if (!isDeviceLinkTokenShape(token)) return { ok: false };
  const hash = hashDeviceSecret(token);
  const link = await findDeviceLinkByHash(hash);
  if (!link || !deviceSecretsMatch(hash, link.tokenHash)) return { ok: false };

  const now = new Date();
  const open = isDeviceLinkOpen({
    usedAt: link.usedAt ? new Date(link.usedAt) : null,
    expiresAt: new Date(link.expiresAt),
    now,
  });
  const hasActiveDevice = await careRecipientHasActiveDevice(
    link.careRecipientId,
    link.accountId,
  );
  if (!canConfirmDeviceLink({ linkOpen: open, hasActiveDevice })) {
    logBound("elder_link_rejected", link.accountId, link.careRecipientId, "closed");
    return { ok: false };
  }

  const consumed = await consumeDeviceLink(link.id, now.toISOString());
  if (!consumed) {
    logBound("elder_link_rejected", link.accountId, link.careRecipientId, "used");
    return { ok: false };
  }

  const secret = createDeviceToken();
  const headerStore = await headers();
  try {
    await insertBoundDevice({
      accountId: link.accountId,
      careRecipientId: link.careRecipientId,
      secretHash: hashDeviceSecret(secret),
      label: classifyDeviceLabel(headerStore.get("user-agent")),
      linkedAtIso: now.toISOString(),
    });
  } catch {
    logBound("elder_link_rejected", link.accountId, link.careRecipientId, "bind_failed");
    return { ok: false };
  }

  await writeElderDeviceCookie(secret);
  logBound("elder_device_bound", link.accountId, link.careRecipientId);
  return { ok: true };
}

function logBound(
  event: string,
  accountId: string,
  careRecipientId: string,
  reason?: string,
) {
  Sentry.captureMessage(event, {
    level: event === "elder_link_rejected" ? "warning" : "info",
    tags: { event, ...(reason ? { reason } : {}) },
    extra: { accountId, careRecipientId },
  });
}
