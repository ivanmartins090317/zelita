"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { familyContent, familyRoutes } from "@/content/family";
import { elderRoutes } from "@/content/elder";
import { getFamilyContext } from "@/modules/accounts";
import { confirmElderDevice } from "@/modules/elder-access/application/confirm-device-link";
import { issueDeviceLink } from "@/modules/elder-access/application/issue-device-link";
import {
  canManageElderDevice,
  DEVICE_LINK_CHANNELS,
} from "@/modules/elder-access/domain/device-link";
import {
  createFamilyDeviceClient,
  revokeDeviceSummary,
} from "@/modules/elder-access/infrastructure/device-link-store";
import * as Sentry from "@sentry/nextjs";

export interface DeviceLinkActionState {
  ok: boolean;
  message: string;
  url?: string;
  expiresLabel?: string;
}

const channelSchema = z.enum([
  DEVICE_LINK_CHANNELS.whatsapp,
  DEVICE_LINK_CHANNELS.inPerson,
]);

export async function issueDeviceLinkAction(
  _previous: DeviceLinkActionState,
  formData: FormData,
): Promise<DeviceLinkActionState> {
  const channel = channelSchema.safeParse(formData.get("channel"));
  if (!channel.success) {
    return { ok: false, message: familyContent.install.invalid };
  }
  try {
    return await issueDeviceLink(channel.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : familyContent.install.invalid;
    return { ok: false, message };
  }
}

export async function revokeElderDeviceAction(
  _previous: DeviceLinkActionState,
  formData: FormData,
): Promise<DeviceLinkActionState> {
  const copy = familyContent.install;
  const deviceId = z.string().uuid().safeParse(formData.get("deviceId"));
  if (!deviceId.success) {
    return { ok: false, message: copy.revokeMissing };
  }

  const ctx = await getFamilyContext();
  if (
    !ctx.accountId ||
    !ctx.userId ||
    !ctx.careRecipientId ||
    !canManageElderDevice(ctx.role)
  ) {
    return { ok: false, message: familyContent.ajustes.errors.accessDenied };
  }

  try {
    const supabase = await createFamilyDeviceClient();
    const revoked = await revokeDeviceSummary(supabase, {
      accountId: ctx.accountId,
      careRecipientId: ctx.careRecipientId,
      deviceId: deviceId.data,
      revokedBy: ctx.userId,
      revokedAtIso: new Date().toISOString(),
    });
    if (!revoked) return { ok: false, message: copy.revokeMissing };
    Sentry.captureMessage("elder_device_revoked", {
      level: "info",
      tags: { event: "elder_device_revoked" },
      extra: {
        accountId: ctx.accountId,
        careRecipientId: ctx.careRecipientId,
      },
    });
    revalidatePath(familyRoutes.instalar);
    revalidatePath(familyRoutes.ajustes);
    revalidatePath(elderRoutes.home, "layout");
    return { ok: true, message: copy.revoked };
  } catch (error) {
    const message = error instanceof Error ? error.message : copy.invalid;
    return { ok: false, message };
  }
}

export async function confirmElderDeviceAction(formData: FormData): Promise<void> {
  const token = z.string().safeParse(formData.get("token"));
  const result =
    token.success ? await confirmElderDevice(token.data) : { ok: false as const };
  if (!result.ok) redirect("/ativar/encerrado");
  redirect(elderRoutes.installed);
}
