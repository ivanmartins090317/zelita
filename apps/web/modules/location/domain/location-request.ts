import {
  ACCOUNT_ROLES,
  type AccountRole,
} from "@/modules/accounts/domain/roles";

import { LOCATION_TIMING } from "../constants";

export const LOCATION_REQUEST_STATUS = {
  open: "open",
  fulfilled: "fulfilled",
  closed: "closed",
} as const;

export type LocationRequestStatus =
  (typeof LOCATION_REQUEST_STATUS)[keyof typeof LOCATION_REQUEST_STATUS];

export const LOCATION_REQUEST_CLOSE_REASON = {
  appNotOpen: "app_not_open",
  gpsFailed: "gps_failed",
  appClosedOrOffline: "app_closed_or_offline",
  consentRevoked: "consent_revoked",
  accountPaused: "account_paused",
} as const;

export type LocationRequestCloseReason =
  (typeof LOCATION_REQUEST_CLOSE_REASON)[keyof typeof LOCATION_REQUEST_CLOSE_REASON];

export const LOCATION_REQUEST_CARD_PHASE = {
  idle: "idle",
  requesting: "requesting",
  appNotOpen: "app_not_open",
  gpsFailed: "gps_failed",
  appClosedOrOffline: "app_closed_or_offline",
  fulfilled: "fulfilled",
  waitCooldown: "wait_cooldown",
  blocked: "blocked",
} as const;

export type LocationRequestCardPhase =
  (typeof LOCATION_REQUEST_CARD_PHASE)[keyof typeof LOCATION_REQUEST_CARD_PHASE];

export type LocationRequestBlockReason =
  | "account_paused"
  | "no_consent"
  | "no_advanced"
  | "no_device";

export interface LocationRequestSnapshot {
  status: LocationRequestStatus;
  requestedAt: string;
  expiresAt: string;
  completedAt: string | null;
  closeReason: LocationRequestCloseReason | null;
  hadFreshPresence: boolean;
  readAttempted: boolean;
}

export interface CanAdminRequestLocationInput {
  role: AccountRole | null;
  accountPaused: boolean;
  consentActive: boolean;
  hasAdvancedLocation: boolean;
  hasActiveDevice: boolean;
  openRequest: LocationRequestSnapshot | null;
  lastRequestedAt: string | null;
  now: Date;
}

export type CanAdminRequestLocationResult =
  | { ok: true }
  | { ok: false; reason: "not_admin" }
  | { ok: false; reason: "blocked"; block: LocationRequestBlockReason }
  | { ok: false; reason: "open_request" }
  | { ok: false; reason: "cooldown" };

export function canAdminRequestLocation(
  input: CanAdminRequestLocationInput,
): CanAdminRequestLocationResult {
  if (!input.role || input.role !== ACCOUNT_ROLES.admin) {
    return { ok: false, reason: "not_admin" };
  }
  if (input.accountPaused) {
    return { ok: false, reason: "blocked", block: "account_paused" };
  }
  if (!input.consentActive) {
    return { ok: false, reason: "blocked", block: "no_consent" };
  }
  if (!input.hasAdvancedLocation) {
    return { ok: false, reason: "blocked", block: "no_advanced" };
  }
  if (!input.hasActiveDevice) {
    return { ok: false, reason: "blocked", block: "no_device" };
  }
  if (
    input.openRequest &&
    input.openRequest.status === LOCATION_REQUEST_STATUS.open
  ) {
    return { ok: false, reason: "open_request" };
  }
  if (
    input.lastRequestedAt &&
    isWithinRequestCooldown(
      input.lastRequestedAt,
      input.now,
      LOCATION_TIMING.requestCooldownMs,
    )
  ) {
    return { ok: false, reason: "cooldown" };
  }
  return { ok: true };
}

export function isWithinRequestCooldown(
  lastRequestedAt: string,
  now: Date,
  cooldownMs: number,
): boolean {
  const last = new Date(lastRequestedAt).getTime();
  const current = now.getTime();
  if (!Number.isFinite(last) || !Number.isFinite(current)) return false;
  return current - last < cooldownMs;
}

export function isPresenceFresh(
  lastSeenAt: string | null,
  now: Date,
  freshMs: number = LOCATION_TIMING.presenceFreshMs,
): boolean {
  if (!lastSeenAt) return false;
  const seen = new Date(lastSeenAt).getTime();
  const current = now.getTime();
  if (!Number.isFinite(seen) || !Number.isFinite(current)) return false;
  return current - seen <= freshMs;
}

export function isLocationRequestExpired(
  request: Pick<LocationRequestSnapshot, "expiresAt">,
  now: Date,
): boolean {
  const expires = new Date(request.expiresAt).getTime();
  const current = now.getTime();
  if (!Number.isFinite(expires) || !Number.isFinite(current)) return false;
  return current >= expires;
}

export function resolveExpiredCloseReason(
  hadFreshPresence: boolean,
): LocationRequestCloseReason {
  if (hadFreshPresence) {
    return LOCATION_REQUEST_CLOSE_REASON.appClosedOrOffline;
  }
  return LOCATION_REQUEST_CLOSE_REASON.appNotOpen;
}

/** Leitura do GPS precisa ser nova — `maximumAge` zero no navegador. */
export function rejectsCachedGeolocation(maximumAgeMs: number): boolean {
  return maximumAgeMs > 0;
}

/** Posição pedida não confirma Casa nem dispara avaliação de saída de zona. */
export function requestedPointSkipsHomeAndZoneEffects(): true {
  return true;
}

export interface ResolveLocationRequestCardInput {
  request: LocationRequestSnapshot | null;
  lastSeenAt: string | null;
  now: Date;
  canRequest: CanAdminRequestLocationResult;
}

export function resolveLocationRequestCardPhase(
  input: ResolveLocationRequestCardInput,
): LocationRequestCardPhase {
  const { request, lastSeenAt, now, canRequest } = input;

  if (!request) {
    if (canRequest.ok) return LOCATION_REQUEST_CARD_PHASE.idle;
    if (canRequest.reason === "cooldown") {
      return LOCATION_REQUEST_CARD_PHASE.waitCooldown;
    }
    if (canRequest.reason === "blocked") {
      return LOCATION_REQUEST_CARD_PHASE.blocked;
    }
    return LOCATION_REQUEST_CARD_PHASE.idle;
  }

  if (request.status === LOCATION_REQUEST_STATUS.fulfilled) {
    return LOCATION_REQUEST_CARD_PHASE.fulfilled;
  }

  if (request.status === LOCATION_REQUEST_STATUS.closed) {
    if (request.closeReason === LOCATION_REQUEST_CLOSE_REASON.gpsFailed) {
      return LOCATION_REQUEST_CARD_PHASE.gpsFailed;
    }
    if (
      request.closeReason === LOCATION_REQUEST_CLOSE_REASON.appClosedOrOffline
    ) {
      return LOCATION_REQUEST_CARD_PHASE.appClosedOrOffline;
    }
    return LOCATION_REQUEST_CARD_PHASE.appNotOpen;
  }

  if (request.readAttempted) {
    return LOCATION_REQUEST_CARD_PHASE.gpsFailed;
  }

  if (isLocationRequestExpired(request, now)) {
    return resolveExpiredCloseReason(request.hadFreshPresence) ===
      LOCATION_REQUEST_CLOSE_REASON.appClosedOrOffline
      ? LOCATION_REQUEST_CARD_PHASE.appClosedOrOffline
      : LOCATION_REQUEST_CARD_PHASE.appNotOpen;
  }

  if (isPresenceFresh(lastSeenAt, now)) {
    return LOCATION_REQUEST_CARD_PHASE.requesting;
  }

  return LOCATION_REQUEST_CARD_PHASE.appNotOpen;
}

export function shouldAttemptGpsForOpenRequest(input: {
  request: LocationRequestSnapshot;
  readAlreadyAttempted: boolean;
  now: Date;
  consentActive: boolean;
  accountPaused: boolean;
}): boolean {
  if (input.accountPaused || !input.consentActive) return false;
  if (input.request.status !== LOCATION_REQUEST_STATUS.open) return false;
  if (input.readAlreadyAttempted) return false;
  if (isLocationRequestExpired(input.request, input.now)) return false;
  return true;
}
