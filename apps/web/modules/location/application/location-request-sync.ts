import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ACCOUNT_STATUSES,
  isAccountPaused,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

import { isLocationConsentActive } from "../domain/location-consent";
import {
  LOCATION_REQUEST_CLOSE_REASON,
  LOCATION_REQUEST_STATUS,
  isLocationRequestExpired,
  resolveExpiredCloseReason,
} from "../domain/location-request";
import {
  closeLocationRequest,
  fetchOpenLocationRequest,
  type LocationRequestRow,
} from "../infrastructure/location-request-repo";

function logLocationRequestUnanswered(extra: Record<string, string>) {
  Sentry.captureMessage("location_request_unanswered", {
    level: "warning",
    tags: { event: "location_request_unanswered" },
    extra,
  });
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

export async function expireOpenLocationRequestIfNeeded(
  supabase: SupabaseClient,
  request: LocationRequestRow,
  input: { now: Date; consentActive: boolean; accountPaused: boolean },
): Promise<LocationRequestRow> {
  if (request.status !== LOCATION_REQUEST_STATUS.open) return request;

  const nowIso = input.now.toISOString();

  if (input.accountPaused) {
    await closeLocationRequest(supabase, request.id, {
      closeReason: LOCATION_REQUEST_CLOSE_REASON.accountPaused,
      completedAt: nowIso,
    });
    logLocationRequestUnanswered({
      requestId: request.id,
      careRecipientId: request.careRecipientId,
    });
    return {
      ...request,
      status: LOCATION_REQUEST_STATUS.closed,
      closeReason: LOCATION_REQUEST_CLOSE_REASON.accountPaused,
      completedAt: nowIso,
    };
  }

  if (!input.consentActive) {
    await closeLocationRequest(supabase, request.id, {
      closeReason: LOCATION_REQUEST_CLOSE_REASON.consentRevoked,
      completedAt: nowIso,
    });
    logLocationRequestUnanswered({
      requestId: request.id,
      careRecipientId: request.careRecipientId,
    });
    return {
      ...request,
      status: LOCATION_REQUEST_STATUS.closed,
      closeReason: LOCATION_REQUEST_CLOSE_REASON.consentRevoked,
      completedAt: nowIso,
    };
  }

  if (!isLocationRequestExpired(request, input.now)) return request;

  const closeReason = resolveExpiredCloseReason(request.hadFreshPresence);
  await closeLocationRequest(supabase, request.id, {
    closeReason,
    completedAt: nowIso,
  });
  logLocationRequestUnanswered({
    requestId: request.id,
    careRecipientId: request.careRecipientId,
  });
  return {
    ...request,
    status: LOCATION_REQUEST_STATUS.closed,
    closeReason,
    completedAt: nowIso,
  };
}

export async function reconcileOpenLocationRequestForRecipient(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  careRecipientId: string,
  accountId: string,
): Promise<void> {
  const open = await fetchOpenLocationRequest(supabase, careRecipientId);
  if (!open) return;

  const [consent, accountPaused] = await Promise.all([
    loadCareRecipientConsent(supabase, careRecipientId),
    loadAccountPaused(supabase, accountId),
  ]);

  const service = createSupabaseServiceClient();
  await expireOpenLocationRequestIfNeeded(service, open, {
    now: new Date(),
    consentActive: isLocationConsentActive(consent),
    accountPaused,
  });
}
