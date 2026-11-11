"use server";

import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { familyContent, familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import {
  ACCOUNT_STATUSES,
  isAccountPaused,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import { hasAdvancedLocation } from "@/modules/billing";
import { lookupActiveDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import {
  careRecipientHasActiveDevice,
  touchDeviceLastSeen,
} from "@/modules/elder-access/infrastructure/device-link-store";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

import { LOCATION_TIMING } from "../constants";
import { canManageSafeZones } from "../domain/can-manage-safe-zones";
import { isLocationConsentActive } from "../domain/location-consent";
import {
  LOCATION_REQUEST_STATUS,
  canAdminRequestLocation,
  isLocationRequestExpired,
  shouldAttemptGpsForOpenRequest,
} from "../domain/location-request";
import { expireOpenLocationRequestIfNeeded } from "./location-request-sync";
import { insertLocationPoint } from "../infrastructure/location-point-repo";
import {
  fetchOpenLocationRequest,
  fetchLatestLocationRequest,
  fulfillLocationRequest,
  insertLocationRequest,
  markLocationRequestFreshPresence,
  markLocationRequestReadAttempted,
} from "../infrastructure/location-request-repo";

const fixSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyM: z.number().min(0).max(100_000).nullable().optional(),
});

const requestIdSchema = z.string().uuid();

export interface LocationRequestActionResult {
  ok: boolean;
  message?: string;
}

export interface DeviceLocationPulseResult {
  shouldRead: boolean;
  requestId: string | null;
}

function logLocationRequestEvent(
  event:
    | "location_requested"
    | "location_request_fulfilled"
    | "location_request_unanswered",
  extra: Record<string, string>,
) {
  Sentry.captureMessage(event, {
    level: event === "location_request_fulfilled" ? "info" : "warning",
    tags: { event },
    extra,
  });
}

function accuracyMeters(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(100_000, Math.max(0, Math.round(value)));
}

async function loadCareRecipientConsent(
  supabase: SupabaseClient,
  careRecipientId: string,
) {
  const { data, error } = await supabase
    .from("care_recipients")
    .select("geo_consent_at, geo_consent_revoked_at")
    .eq("id", careRecipientId)
    .single();

  if (error) throw new Error(error.message);
  return {
    geoConsentAt: (data.geo_consent_at as string | null) ?? null,
    geoConsentRevokedAt:
      (data.geo_consent_revoked_at as string | null) ?? null,
  };
}

async function loadAccountPaused(
  supabase: SupabaseClient,
  accountId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("accounts")
    .select("status")
    .eq("id", accountId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const status = (data?.status as AccountStatus | null) ?? ACCOUNT_STATUSES.active;
  return isAccountPaused(status);
}

async function loadAccountPlan(
  supabase: SupabaseClient,
  accountId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("accounts")
    .select("plan")
    .eq("id", accountId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.plan as string | null) ?? null;
}

export async function createLocationRequestAction(): Promise<LocationRequestActionResult> {
  const copy = familyContent.localizacao.locationRequest;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.userId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, message: copy.errors.notAdmin };
    }

    const supabase = await createSupabaseServerClient();
    const [consentInput, hasDevice, openRequest, latestRequest, accountPaused] =
      await Promise.all([
        loadCareRecipientConsent(supabase, ctx.careRecipientId),
        careRecipientHasActiveDevice(ctx.careRecipientId, ctx.accountId),
        fetchOpenLocationRequest(supabase, ctx.careRecipientId),
        fetchLatestLocationRequest(supabase, ctx.careRecipientId),
        ctx.accountStatus
          ? Promise.resolve(isAccountPaused(ctx.accountStatus))
          : loadAccountPaused(supabase, ctx.accountId),
      ]);

    const account = await supabase
      .from("accounts")
      .select("plan")
      .eq("id", ctx.accountId)
      .maybeSingle();
    if (account.error) throw new Error(account.error.message);

    const now = new Date();
    const gate = canAdminRequestLocation({
      role: ctx.role,
      accountPaused,
      consentActive: isLocationConsentActive(consentInput),
      hasAdvancedLocation: hasAdvancedLocation(
        (account.data?.plan as string | null) ?? null,
      ),
      hasActiveDevice: hasDevice,
      openRequest,
      lastRequestedAt: latestRequest?.requestedAt ?? null,
      now,
    });

    if (!gate.ok) {
      if (gate.reason === "not_admin") {
        return { ok: false, message: copy.errors.notAdmin };
      }
      if (gate.reason === "open_request") {
        return { ok: false, message: copy.states.requesting };
      }
      if (gate.reason === "cooldown") {
        return { ok: false, message: copy.errors.cooldown };
      }
      if (gate.reason === "blocked") {
        const messages = {
          account_paused: copy.errors.accountPaused,
          no_consent: copy.errors.noConsent,
          no_advanced: copy.errors.noAdvanced,
          no_device: copy.errors.noDevice,
        } as const;
        return { ok: false, message: messages[gate.block] };
      }
    }

    if (!canManageSafeZones(ctx.role)) {
      return { ok: false, message: copy.errors.notAdmin };
    }

    const requestedAt = now.toISOString();
    const expiresAt = new Date(
      now.getTime() + LOCATION_TIMING.requestExpiryMs,
    ).toISOString();

    const created = await insertLocationRequest(supabase, {
      accountId: ctx.accountId,
      careRecipientId: ctx.careRecipientId,
      requestedBy: ctx.userId,
      requestedAt,
      expiresAt,
    });

    logLocationRequestEvent("location_requested", {
      requestId: created.id,
      careRecipientId: ctx.careRecipientId,
    });

    revalidatePath(familyRoutes.localizacao);
    return { ok: true, message: copy.states.requesting };
  } catch {
    return { ok: false, message: copy.errors.saveFailed };
  }
}

export async function deviceLocationRequestPulseAction(): Promise<DeviceLocationPulseResult> {
  const device = await lookupActiveDeviceCookie();
  if (device.status !== "active") {
    return { shouldRead: false, requestId: null };
  }

  const supabase = createSupabaseServiceClient();
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    await touchDeviceLastSeen(device.device.id, nowIso);
  } catch {
    return { shouldRead: false, requestId: null };
  }

  let open = await fetchOpenLocationRequest(
    supabase,
    device.device.careRecipientId,
  );
  if (!open) return { shouldRead: false, requestId: null };

  const [consentInput, accountPaused, plan] = await Promise.all([
    loadCareRecipientConsent(supabase, device.device.careRecipientId),
    loadAccountPaused(supabase, device.device.accountId),
    loadAccountPlan(supabase, device.device.accountId),
  ]);

  const consentActive = isLocationConsentActive(consentInput);

  open = await expireOpenLocationRequestIfNeeded(supabase, open, {
    now,
    consentActive,
    accountPaused,
  });
  if (open.status !== LOCATION_REQUEST_STATUS.open) {
    revalidatePath(familyRoutes.localizacao);
    return { shouldRead: false, requestId: null };
  }

  await markLocationRequestFreshPresence(supabase, open.id);

  const advancedOk = hasAdvancedLocation(plan);
  if (
    !shouldAttemptGpsForOpenRequest({
      request: open,
      readAlreadyAttempted: open.readAttempted,
      now,
      consentActive: consentActive && advancedOk,
      accountPaused,
    })
  ) {
    return { shouldRead: false, requestId: null };
  }

  return { shouldRead: true, requestId: open.id };
}

export async function fulfillLocationRequestFromDeviceAction(
  input: unknown,
): Promise<{ ok: boolean }> {
  const parsed = z
    .object({
      requestId: requestIdSchema,
      fix: fixSchema,
    })
    .safeParse(input);

  if (!parsed.success) return { ok: false };

  const device = await lookupActiveDeviceCookie();
  if (device.status !== "active") return { ok: false };

  const supabase = createSupabaseServiceClient();
  const now = new Date();

  const { data: requestRow, error } = await supabase
    .from("location_requests")
    .select("*")
    .eq("id", parsed.data.requestId)
    .maybeSingle();

  if (error || !requestRow) return { ok: false };

  if (
    (requestRow.care_recipient_id as string) !== device.device.careRecipientId
  ) {
    return { ok: false };
  }
  if ((requestRow.status as string) !== LOCATION_REQUEST_STATUS.open) {
    return { ok: false };
  }
  if (Boolean(requestRow.read_attempted)) return { ok: false };
  if (isLocationRequestExpired({ expiresAt: requestRow.expires_at as string }, now)) {
    return { ok: false };
  }

  const recordedAt = now.toISOString();
  const fix = parsed.data.fix;

  try {
    const pointId = await insertLocationPoint(supabase, {
      careRecipientId: device.device.careRecipientId,
      lat: fix.lat,
      lng: fix.lng,
      accuracyM: accuracyMeters(fix.accuracyM ?? null),
      recordedAt,
      source: "on_demand",
    });

    await fulfillLocationRequest(supabase, parsed.data.requestId, {
      locationPointId: pointId,
      completedAt: recordedAt,
    });

    logLocationRequestEvent("location_request_fulfilled", {
      requestId: parsed.data.requestId,
      careRecipientId: device.device.careRecipientId,
    });

    revalidatePath(familyRoutes.localizacao);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function failLocationRequestGpsAction(
  requestId: unknown,
): Promise<{ ok: boolean }> {
  const parsed = requestIdSchema.safeParse(requestId);
  if (!parsed.success) return { ok: false };

  const device = await lookupActiveDeviceCookie();
  if (device.status !== "active") return { ok: false };

  const supabase = createSupabaseServiceClient();

  const { data: requestRow, error } = await supabase
    .from("location_requests")
    .select("id, care_recipient_id, status, read_attempted")
    .eq("id", parsed.data)
    .maybeSingle();

  if (error || !requestRow) return { ok: false };
  if (
    (requestRow.care_recipient_id as string) !== device.device.careRecipientId
  ) {
    return { ok: false };
  }
  if ((requestRow.status as string) !== LOCATION_REQUEST_STATUS.open) {
    return { ok: false };
  }
  if (Boolean(requestRow.read_attempted)) return { ok: false };

  const completedAt = new Date().toISOString();
  try {
    await markLocationRequestReadAttempted(supabase, parsed.data, {
      completedAt,
    });
    logLocationRequestEvent("location_request_unanswered", {
      requestId: parsed.data,
      careRecipientId: device.device.careRecipientId,
    });
    revalidatePath(familyRoutes.localizacao);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
