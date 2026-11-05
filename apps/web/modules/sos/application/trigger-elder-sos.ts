"use server";

import * as Sentry from "@sentry/nextjs";

import { z } from "zod";

import { elderContent } from "@/content/elder";
import { lookupActiveDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import { requestSosNotify } from "@/lib/inngest/notify-sos";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { isLocationConsentActive } from "@/modules/location/domain/location-consent";
import {
  applyActiveDeviceFix,
  type DevicePointSource,
} from "@/modules/location/application/record-foreground-position";
import { shouldHoldOpenSosRepeat } from "../domain/sos-repeat";
import {
  fetchLatestOpenSosAlert,
  insertElderSosAlert,
} from "../infrastructure/sos-alert-repo";

export interface TriggerElderSosResult {
  ok: boolean;
  outcome?: "created" | "held";
  tryPosition?: boolean;
  message?: string;
}

const fixSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyM: z.number().min(0).max(100_000).nullable().optional(),
});

function readFix(input: unknown): { lat: number; lng: number; accuracyM: number | null } | null {
  const parsed = fixSchema.safeParse(input);
  if (!parsed.success) return null;
  return {
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    accuracyM: parsed.data.accuracyM ?? null,
  };
}

function logSosFailure(careRecipientId?: string, alertId?: string) {
  Sentry.captureMessage("sos_requested", {
    level: "error",
    tags: { event: "sos_requested" },
    extra: { careRecipientId, alertId },
  });
}

export async function triggerElderSosAction(): Promise<TriggerElderSosResult> {
  let careRecipientId = "";
  try {
    const device = await lookupActiveDeviceCookie();
    if (device.status !== "active") {
      return { ok: false, message: elderContent.sos.persistError };
    }
    careRecipientId = device.device.careRecipientId;
    const supabase = createSupabaseServiceClient();
    const now = new Date();
    const open = await fetchLatestOpenSosAlert(supabase, careRecipientId);
    if (
      shouldHoldOpenSosRepeat({
        now,
        openAlertTriggeredAt: open ? new Date(open.triggeredAt) : null,
      })
    ) {
      return { ok: true, outcome: "held" };
    }

    const alert = await insertElderSosAlert(supabase, {
      careRecipientId,
      triggeredAt: now.toISOString(),
    });
    const recipient = await supabase
      .from("care_recipients")
      .select("geo_consent_at, geo_consent_revoked_at")
      .eq("id", careRecipientId)
      .maybeSingle();
    if (recipient.error) throw new Error(recipient.error.message);

    await requestSosNotify(alert.id);
    return {
      ok: true,
      outcome: "created",
      tryPosition: isLocationConsentActive({
        geoConsentAt: (recipient.data?.geo_consent_at as string | null) ?? null,
        geoConsentRevokedAt:
          (recipient.data?.geo_consent_revoked_at as string | null) ?? null,
      }),
    };
  } catch {
    logSosFailure(careRecipientId || undefined);
    return { ok: false, message: elderContent.sos.persistError };
  }
}

export async function attachElderSosPositionAction(
  input: unknown,
): Promise<{ ok: boolean }> {
  const fix = readFix(input);
  if (!fix) return { ok: false };
  const source: DevicePointSource = "sos";
  try {
    await applyActiveDeviceFix({
      source,
      fix,
      recordedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch {
    logSosFailure();
    return { ok: true };
  }
}
