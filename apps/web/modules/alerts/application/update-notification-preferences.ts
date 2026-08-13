"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { familyContent, familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canEditNotificationPreferences } from "./can-edit-notification-preferences";
import {
  NOTIFICATION_ALERT_TYPE,
  NOTIFICATION_CHANNEL,
  type NotificationAlertType,
  type NotificationChannel,
} from "../domain/alert-feed-types";
import { validateNotificationPreference } from "../domain/notification-channels";
import {
  logNotificationPrefsUpdated,
  upsertNotificationPreferences,
} from "../infrastructure/notification-prefs-repo";

export interface UpdateNotificationPreferencesResult {
  ok: boolean;
  message?: string;
}

const preferenceSchema = z.object({
  memberId: z.string().uuid(),
  alertType: z.enum([
    NOTIFICATION_ALERT_TYPE.sos,
    NOTIFICATION_ALERT_TYPE.packRefill,
    NOTIFICATION_ALERT_TYPE.zoneExit,
    NOTIFICATION_ALERT_TYPE.reminderUnread,
  ]),
  channels: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(
      z.array(
        z.enum([
          NOTIFICATION_CHANNEL.panel,
          NOTIFICATION_CHANNEL.email,
          NOTIFICATION_CHANNEL.whatsapp,
          NOTIFICATION_CHANNEL.call,
        ]),
      ),
    ),
});

export async function updateNotificationPreferencesAction(
  _prev: UpdateNotificationPreferencesResult,
  formData: FormData,
): Promise<UpdateNotificationPreferencesResult> {
  const copy = familyContent.avisos.errors;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role) {
      return { ok: false, message: copy.forbidden };
    }
    if (!canEditNotificationPreferences(ctx.role)) {
      return { ok: false, message: copy.forbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.accountPaused };
    }

    const parsed = preferenceSchema.safeParse({
      memberId: formData.get("memberId"),
      alertType: formData.get("alertType"),
      channels: formData.get("channels"),
    });

    if (!parsed.success) {
      return { ok: false, message: copy.invalidPayload };
    }

    const supabase = await createSupabaseServerClient();
    const members = await fetchParticipantRows(supabase, ctx.accountId);
    const member = members.find(
      (row) => row.kind === "member" && row.id === parsed.data.memberId,
    );

    if (!member || member.kind !== "member") {
      return { ok: false, message: copy.memberNotFound };
    }

    const validation = validateNotificationPreference({
      role: member.role,
      alertType: parsed.data.alertType as NotificationAlertType,
      channels: parsed.data.channels as NotificationChannel[],
    });

    if (!validation.ok) {
      if (validation.reason === "sos_emergency_required") {
        return { ok: false, message: copy.sosEmergencyRequired };
      }
      return { ok: false, message: copy.invalidChannels };
    }

    await upsertNotificationPreferences(supabase, {
      accountId: ctx.accountId,
      memberId: parsed.data.memberId,
      preferences: [
        {
          alertType: parsed.data.alertType as NotificationAlertType,
          channels: validation.channels,
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    logNotificationPrefsUpdated({
      accountId: ctx.accountId,
      memberId: parsed.data.memberId,
      alertType: parsed.data.alertType,
    });

    revalidatePath(familyRoutes.avisos);
    revalidatePath(familyRoutes.hoje);

    return { ok: true, message: familyContent.avisos.matrix.saveSuccess };
  } catch {
    return { ok: false, message: copy.saveFailed };
  }
}
