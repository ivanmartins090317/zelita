"use server";

import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { hasAdvancedLocation } from "@/modules/billing";
import { lookupActiveDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import { deliverZoneExitEmails } from "@/lib/inngest/notify-sos";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { shouldHoldOpenSosRepeat } from "@/modules/sos/domain/sos-repeat";
import { fetchLatestOpenSosAlert } from "@/modules/sos/infrastructure/sos-alert-repo";

import { hasConfirmedHomeCoords } from "../domain/home-coords";
import { isLocationConsentActive } from "../domain/location-consent";
import { isInsideSafeZone } from "../domain/safe-zone-status";
import {
  canAttemptZoneReading,
  resolveZoneTransition,
  ZONE_TRANSITION,
  type ZoneReadingGate,
} from "../domain/zone-transition";
import {
  fetchLatestZoneBoundary,
  insertGeofenceEvent,
} from "../infrastructure/geofence-event-repo";
import {
  fetchLatestLocationPoint,
  fetchSosLocationPointNear,
  insertLocationPoint,
  type LocationPointRow,
} from "../infrastructure/location-point-repo";
import { fetchHomePlace, type SafePlaceRow } from "../infrastructure/safe-place-repo";

const deviceFixSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyM: z.number().min(0).max(100_000).nullable().optional(),
});

const DEVICE_POINT_SOURCE = {
  sos: "sos",
  periodic: "periodic",
  homeConfirm: "home_confirm",
} as const;

export type DevicePointSource =
  (typeof DEVICE_POINT_SOURCE)[keyof typeof DEVICE_POINT_SOURCE];

export interface DeviceFix {
  lat: number;
  lng: number;
  accuracyM: number | null;
}

interface ZoneSnapshot {
  gate: ZoneReadingGate;
  home: SafePlaceRow | null;
  label: string;
}

function parseDeviceFix(input: unknown): DeviceFix | null {
  const parsed = deviceFixSchema.safeParse(input);
  if (!parsed.success) return null;
  return {
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    accuracyM: parsed.data.accuracyM ?? null,
  };
}

function accuracyMeters(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(100_000, Math.max(0, Math.round(value)));
}

function careLabel(value: string | null | undefined): string {
  const cleaned = (value ?? "").replace(/[\r\n]+/g, " ").trim();
  return cleaned.slice(0, 80) || "A pessoa cuidada";
}

function logZoneFailure(careRecipientId: string) {
  Sentry.captureMessage("zone_exit", {
    level: "error",
    tags: { event: "zone_exit" },
    extra: { careRecipientId },
  });
}

function pointInside(
  point: { lat: number; lng: number } | null,
  home: SafePlaceRow | null,
): boolean {
  if (!point || !home) return false;
  return isInsideSafeZone(point, {
    lat: home.lat,
    lng: home.lng,
    radiusM: home.radiusM,
    coordsConfirmedAt: home.coordsConfirmedAt,
  });
}

async function loadZoneGate(
  supabase: SupabaseClient,
  careRecipientId: string,
  accountId: string,
): Promise<ZoneSnapshot> {
  const [home, recipient, account] = await Promise.all([
    fetchHomePlace(supabase, careRecipientId),
    supabase
      .from("care_recipients")
      .select("display_name, geo_consent_at, geo_consent_revoked_at")
      .eq("id", careRecipientId)
      .maybeSingle(),
    supabase.from("accounts").select("plan").eq("id", accountId).maybeSingle(),
  ]);
  if (recipient.error) throw new Error(recipient.error.message);
  if (account.error) throw new Error(account.error.message);

  return {
    home,
    label: careLabel(recipient.data?.display_name as string | undefined),
    gate: {
      hasAdvancedLocation: hasAdvancedLocation(
        (account.data?.plan as string | null) ?? null,
      ),
      homeConfirmed: home ? hasConfirmedHomeCoords(home) : false,
      alertOnExit: Boolean(home?.alertOnExit),
      consentActive: isLocationConsentActive({
        geoConsentAt: (recipient.data?.geo_consent_at as string | null) ?? null,
        geoConsentRevokedAt:
          (recipient.data?.geo_consent_revoked_at as string | null) ?? null,
      }),
    },
  };
}

async function maybeRecordTransition(input: {
  supabase: SupabaseClient;
  zone: ZoneSnapshot;
  careRecipientId: string;
  accountId: string;
  recordedAt: string;
  previous: LocationPointRow | null;
  next: DeviceFix;
}): Promise<void> {
  if (!input.zone.home || !canAttemptZoneReading(input.zone.gate)) return;
  const previousPoint =
    input.previous?.lat != null && input.previous.lng != null
      ? { lat: input.previous.lat, lng: input.previous.lng }
      : null;
  const boundary = await fetchLatestZoneBoundary(
    input.supabase,
    input.careRecipientId,
  );
  const kind = resolveZoneTransition({
    gate: input.zone.gate,
    previousInside: pointInside(previousPoint, input.zone.home),
    nextInside: pointInside(input.next, input.zone.home),
    hasOpenExit: boundary?.eventType === "zone_exit",
  });
  if (kind === ZONE_TRANSITION.none || !input.zone.home) return;

  await insertGeofenceEvent(input.supabase, {
    careRecipientId: input.careRecipientId,
    safePlaceId: input.zone.home.id,
    eventType: kind === ZONE_TRANSITION.exit ? "zone_exit" : "zone_return",
    placeName: input.zone.home.name,
    recordedAt: input.recordedAt,
  });
  if (kind !== ZONE_TRANSITION.exit) return;
  await deliverZoneExitEmails({
    accountId: input.accountId,
    careRecipientId: input.careRecipientId,
    label: input.zone.label,
  });
}

async function sosPointAlreadyFresh(
  supabase: SupabaseClient,
  careRecipientId: string,
  recordedAt: string,
): Promise<boolean> {
  const open = await fetchLatestOpenSosAlert(supabase, careRecipientId);
  const fresh =
    open != null &&
    shouldHoldOpenSosRepeat({
      now: new Date(recordedAt),
      openAlertTriggeredAt: new Date(open.triggeredAt),
    });
  if (!fresh || !open) return true;
  const existing = await fetchSosLocationPointNear(
    supabase,
    careRecipientId,
    open.triggeredAt,
  );
  return Boolean(existing);
}

export async function applyActiveDeviceFix(input: {
  source: DevicePointSource;
  fix: DeviceFix;
  recordedAt: string;
}): Promise<void> {
  const device = await lookupActiveDeviceCookie();
  if (device.status !== "active") return;

  const supabase = createSupabaseServiceClient();
  const careRecipientId = device.device.careRecipientId;
  const accountId = device.device.accountId;
  const zone = await loadZoneGate(supabase, careRecipientId, accountId);
  if (
    input.source === DEVICE_POINT_SOURCE.periodic &&
    !canAttemptZoneReading(zone.gate)
  ) {
    return;
  }
  if (
    input.source === DEVICE_POINT_SOURCE.sos &&
    (await sosPointAlreadyFresh(supabase, careRecipientId, input.recordedAt))
  ) {
    return;
  }

  const previous = await fetchLatestLocationPoint(supabase, careRecipientId);
  await insertLocationPoint(supabase, {
    careRecipientId,
    lat: input.fix.lat,
    lng: input.fix.lng,
    accuracyM: accuracyMeters(input.fix.accuracyM),
    recordedAt: input.recordedAt,
    source: input.source,
  });

  try {
    await maybeRecordTransition({
      supabase,
      zone,
      careRecipientId,
      accountId,
      recordedAt: input.recordedAt,
      previous,
      next: input.fix,
    });
  } catch {
    logZoneFailure(careRecipientId);
  }
}

export async function shouldReadForegroundPositionAction(): Promise<{ ok: boolean }> {
  const device = await lookupActiveDeviceCookie();
  if (device.status !== "active") return { ok: false };
  try {
    const supabase = createSupabaseServiceClient();
    const zone = await loadZoneGate(
      supabase,
      device.device.careRecipientId,
      device.device.accountId,
    );
    return { ok: canAttemptZoneReading(zone.gate) };
  } catch {
    logZoneFailure(device.device.careRecipientId);
    return { ok: false };
  }
}

export async function recordForegroundPositionAction(
  input: unknown,
): Promise<{ ok: boolean }> {
  const fix = parseDeviceFix(input);
  if (!fix) return { ok: false };
  try {
    await applyActiveDeviceFix({
      source: DEVICE_POINT_SOURCE.periodic,
      fix,
      recordedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch {
    const device = await lookupActiveDeviceCookie();
    if (device.status === "active") logZoneFailure(device.device.careRecipientId);
    return { ok: false };
  }
}
