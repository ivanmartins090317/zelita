"use server";

import * as Sentry from "@sentry/nextjs";

import { elderContent } from "@/content/elder";
import { lookupActiveDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

import { z } from "zod";

import {
  applyActiveDeviceFix,
  type DevicePointSource,
} from "./record-foreground-position";
import {
  confirmHomePlaceCoords,
  fetchHomePlace,
  grantCareRecipientLocationConsent,
} from "../infrastructure/safe-place-repo";

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

function logHomeFailure(careRecipientId: string) {
  Sentry.captureMessage("home_confirmed", {
    level: "error",
    tags: { event: "home_confirmed" },
    extra: { careRecipientId },
  });
}

export async function confirmHomeFromDeviceAction(
  input: unknown,
): Promise<{ ok: boolean; message?: string }> {
  const fix = readFix(input);
  if (!fix) return { ok: false, message: elderContent.casa.denied };

  let careRecipientId = "";
  try {
    const device = await lookupActiveDeviceCookie();
    if (device.status !== "active") {
      return { ok: false, message: elderContent.casa.denied };
    }
    careRecipientId = device.device.careRecipientId;
    const supabase = createSupabaseServiceClient();
    const home = await fetchHomePlace(supabase, careRecipientId);
    if (!home) return { ok: false, message: elderContent.casa.denied };

    const confirmedAt = new Date().toISOString();
    await confirmHomePlaceCoords(supabase, {
      placeId: home.id,
      lat: fix.lat,
      lng: fix.lng,
      confirmedAt,
    });
    await grantCareRecipientLocationConsent(supabase, {
      careRecipientId,
      grantedAt: confirmedAt,
    });
    const source: DevicePointSource = "home_confirm";
    await applyActiveDeviceFix({
      source,
      fix,
      recordedAt: confirmedAt,
    });
    return { ok: true };
  } catch {
    if (careRecipientId) logHomeFailure(careRecipientId);
    return { ok: false, message: elderContent.casa.denied };
  }
}
