import { familyContent, familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import {
  isAccountPaused,
  type AccountRole,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { hasAdvancedLocation } from "@/modules/billing";
import { careRecipientHasActiveDevice } from "@/modules/elder-access/infrastructure/device-link-store";

import { reconcileOpenLocationRequestForRecipient } from "./location-request-sync";
import { canViewLocation } from "../domain/can-view-location";
import { canManageSafeZones } from "../domain/can-manage-safe-zones";
import {
  LOCATION_REQUEST_CARD_PHASE,
  LOCATION_REQUEST_STATUS,
  canAdminRequestLocation,
  resolveLocationRequestCardPhase,
  type LocationRequestCardPhase,
} from "../domain/location-request";
import {
  LOCATION_CONSENT_STATUS,
  isLocationConsentActive,
  resolveLocationConsent,
} from "../domain/location-consent";
import { resolveHistorySituationLabel } from "../domain/location-history-labels";
import { canCreateLocationShare } from "../domain/location-share";
import { hasConfirmedHomeCoords } from "../domain/home-coords";
import { resolveMapZoneTag, resolvePlacePresence } from "../domain/safe-zone-status";
import { fetchGeofenceEventsSince } from "../infrastructure/geofence-event-repo";
import {
  fetchActiveDeviceLastSeen,
  fetchLatestLocationRequest,
  fetchOpenLocationRequest,
} from "../infrastructure/location-request-repo";
import {
  fetchLatestLocationPoint,
  fetchLocationPointsSince,
} from "../infrastructure/location-point-repo";
import { fetchSafePlacesForCareRecipient } from "../infrastructure/safe-place-repo";
import {
  buildExternalMapUrl,
  formatRelativeTimeAgo,
  normalizeMapPinPosition,
  toSafePlaceCoords,
} from "./resolve-location-for-sos";

const TIME_ZONE = "America/Sao_Paulo";
const HISTORY_DAYS = 7;

export interface LocationMapViewModel {
  hasPosition: boolean;
  isFrozen: boolean;
  emptyTitle: string;
  emptyDescription: string;
  pinLabel: string | null;
  pinPosition: { xPct: number; yPct: number } | null;
  accuracyLabel: string | null;
  zoneTag: string | null;
  zoneTagTone: "safe" | "warning" | "muted";
  externalMapUrl: string | null;
  addressOnly: string | null;
  showShareButton: boolean;
}

export interface LocationStatViewModel {
  label: string;
  value: string;
  hint: string;
}

export interface SafePlaceListItem {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  tagLabel: string;
  tagTone: "safe" | "warning" | "muted";
  isHome: boolean;
  canEdit: boolean;
  canDelete: boolean;
  alertOnExit: boolean;
  alertOnExitDisabled: boolean;
  addressText: string;
  radiusM: number;
}

export interface LocationHistoryItem {
  id: string;
  whenLabel: string;
  whereLabel: string;
  situationLabel: string;
  situationTone: "safe" | "warning" | "return" | "muted";
}

export interface LocationRequestCardViewModel {
  canSubmit: boolean;
  pollWhileOpen: boolean;
  statusMessage: string | null;
  title: string;
  hint: string;
  buttonLabel: string;
  buttonPendingLabel: string;
}

export interface LocalizacaoPageViewModel {
  careRecipientId: string;
  careRecipientDisplayName: string;
  locationRequest: LocationRequestCardViewModel | null;
  consentStatus: string;
  consentBanner: {
    tone: "info" | "warning" | "muted";
    title: string;
    body: string;
  };
  map: LocationMapViewModel;
  stats: LocationStatViewModel[];
  safePlaces: SafePlaceListItem[];
  canManagePlaces: boolean;
  canCreateShare: boolean;
  shareDisabledReason: string | null;
  history: LocationHistoryItem[];
  historyEmpty: boolean;
  focusAlert: boolean;
}

export type LocalizacaoPageResult =
  | { ok: true; data: LocalizacaoPageViewModel }
  | { ok: false; reason: "forbidden" | "load_failed"; message: string };

function formatDateTime(iso: string): { date: string; time: string } {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date) ===
    new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date) ===
    new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(yesterday);

  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  if (isToday) return { date: "Hoje", time };
  if (isYesterday) return { date: "Ontem", time };

  const datePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(date);

  return { date: datePart, time };
}

function defaultMapBounds(lat: number, lng: number) {
  return {
    minLat: lat - 0.008,
    maxLat: lat + 0.008,
    minLng: lng - 0.008,
    maxLng: lng + 0.008,
  };
}

function resolveLocationRequestStatusMessage(
  phase: LocationRequestCardPhase,
  copy: typeof familyContent.localizacao.locationRequest,
): string | null {
  switch (phase) {
    case LOCATION_REQUEST_CARD_PHASE.requesting:
      return copy.states.requesting;
    case LOCATION_REQUEST_CARD_PHASE.appNotOpen:
      return copy.states.appNotOpen;
    case LOCATION_REQUEST_CARD_PHASE.gpsFailed:
      return copy.states.gpsFailed;
    case LOCATION_REQUEST_CARD_PHASE.appClosedOrOffline:
      return copy.states.appClosedOrOffline;
    case LOCATION_REQUEST_CARD_PHASE.fulfilled:
      return copy.states.fulfilled;
    case LOCATION_REQUEST_CARD_PHASE.waitCooldown:
      return copy.errors.cooldown;
    case LOCATION_REQUEST_CARD_PHASE.blocked:
      return null;
    default:
      return null;
  }
}

function resolveBlockedRequestMessage(
  gate: ReturnType<typeof canAdminRequestLocation>,
  copy: typeof familyContent.localizacao.locationRequest,
): string | null {
  if (gate.ok || gate.reason !== "blocked") return null;
  const messages = {
    account_paused: copy.errors.accountPaused,
    no_consent: copy.errors.noConsent,
    no_advanced: copy.errors.noAdvanced,
    no_device: copy.errors.noDevice,
  } as const;
  return messages[gate.block];
}

async function buildLocationRequestCard(input: {
  copy: typeof familyContent.localizacao;
  role: AccountRole;
  accountId: string;
  accountStatus: AccountStatus | null | undefined;
  accountPlan: string | null;
  careRecipientId: string;
  consentInput: {
    geoConsentAt: string | null;
    geoConsentRevokedAt: string | null;
  };
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
}): Promise<LocationRequestCardViewModel | null> {
  if (!canManageSafeZones(input.role)) {
    return null;
  }

  const reqCopy = input.copy.locationRequest;
  await reconcileOpenLocationRequestForRecipient(
    input.supabase,
    input.careRecipientId,
    input.accountId,
  );

  const now = new Date();
  const [openRequest, latestRequest, lastSeenAt, hasDevice] = await Promise.all([
    fetchOpenLocationRequest(input.supabase, input.careRecipientId),
    fetchLatestLocationRequest(input.supabase, input.careRecipientId),
    fetchActiveDeviceLastSeen(
      input.supabase,
      input.accountId,
      input.careRecipientId,
    ),
    careRecipientHasActiveDevice(input.careRecipientId, input.accountId),
  ]);

  const displayRequest = openRequest ?? latestRequest;
  const consentActive = isLocationConsentActive(input.consentInput);
  const accountPaused = input.accountStatus
    ? isAccountPaused(input.accountStatus)
    : false;

  const gate = canAdminRequestLocation({
    role: input.role,
    accountPaused,
    consentActive,
    hasAdvancedLocation: hasAdvancedLocation(input.accountPlan),
    hasActiveDevice: hasDevice,
    openRequest,
    lastRequestedAt: latestRequest?.requestedAt ?? null,
    now,
  });

  const phase = resolveLocationRequestCardPhase({
    request: displayRequest,
    lastSeenAt,
    now,
    canRequest: gate,
  });

  let statusMessage = resolveLocationRequestStatusMessage(phase, reqCopy);
  if (phase === LOCATION_REQUEST_CARD_PHASE.blocked) {
    statusMessage = resolveBlockedRequestMessage(gate, reqCopy);
  }

  const requestOpen = openRequest?.status === LOCATION_REQUEST_STATUS.open;

  return {
    canSubmit: gate.ok && phase === LOCATION_REQUEST_CARD_PHASE.idle,
    pollWhileOpen: Boolean(requestOpen),
    statusMessage,
    title: reqCopy.title,
    hint: reqCopy.hint,
    buttonLabel: reqCopy.button,
    buttonPendingLabel: reqCopy.buttonPending,
  };
}

function resolvePlaceIcon(name: string, icon: string | null, isHome: boolean): string {
  if (icon) return icon;
  if (isHome) return "🏠";
  return "📍";
}

function buildMapViewModel(input: {
  copy: typeof familyContent.localizacao;
  apelido: string;
  latestPoint: Awaited<ReturnType<typeof fetchLatestLocationPoint>>;
  placeCoords: ReturnType<typeof toSafePlaceCoords>;
  consentStatus: string;
  hasPosition: boolean;
  hasCoords: boolean;
  hasText: boolean;
  isFrozen: boolean;
  canManage: boolean;
}): LocationMapViewModel {
  const {
    copy,
    apelido,
    latestPoint,
    placeCoords,
    consentStatus,
    hasPosition,
    hasCoords,
    hasText,
    isFrozen,
    canManage,
  } = input;

  const base: LocationMapViewModel = {
    hasPosition:
      hasPosition &&
      !(
        !isFrozen &&
        consentStatus === LOCATION_CONSENT_STATUS.pending &&
        !hasPosition
      ),
    isFrozen,
    emptyTitle: copy.map.emptyTitle,
    emptyDescription:
      isFrozen && hasPosition ? copy.map.frozenHint : copy.map.emptyDescription,
    pinLabel: null,
    pinPosition: null,
    accuracyLabel: null,
    zoneTag: null,
    zoneTagTone: "muted",
    externalMapUrl: null,
    addressOnly: null,
    showShareButton: false,
  };

  if (!hasPosition) return base;

  const showDespiteRevoked =
    isFrozen || consentStatus === LOCATION_CONSENT_STATUS.active;
  if (!showDespiteRevoked && consentStatus !== LOCATION_CONSENT_STATUS.pending) {
    return base;
  }

  const map: LocationMapViewModel = { ...base, hasPosition: true };

  if (hasCoords && latestPoint?.lat != null && latestPoint?.lng != null) {
    const zone = resolveMapZoneTag(
      { lat: latestPoint.lat, lng: latestPoint.lng },
      placeCoords,
    );
    const bounds = defaultMapBounds(latestPoint.lat, latestPoint.lng);
    const pin = normalizeMapPinPosition(
      latestPoint.lat,
      latestPoint.lng,
      bounds,
    );
    const timeLabel = formatDateTime(latestPoint.recordedAt).time;

    map.pinLabel = copy.map.pinLabel
      .replace("{apelido}", apelido)
      .replace("{hora}", timeLabel);
    map.pinPosition = pin;
    map.externalMapUrl = buildExternalMapUrl({
      lat: latestPoint.lat,
      lng: latestPoint.lng,
    });

    if (zone.tag === "safe" && zone.placeName) {
      map.zoneTag = copy.map.zoneSafe.replace("{lugar}", zone.placeName);
      map.zoneTagTone = "safe";
    } else if (zone.tag === "outside") {
      map.zoneTag = copy.map.zoneOutside;
      map.zoneTagTone = "warning";
    }
  } else if (hasText && latestPoint?.locationText) {
    map.addressOnly = latestPoint.locationText;
    map.externalMapUrl = buildExternalMapUrl({
      address: latestPoint.locationText,
    });
  }

  if (latestPoint?.accuracyM != null) {
    map.accuracyLabel = copy.map.accuracy.replace(
      "{metros}",
      String(latestPoint.accuracyM),
    );
  }

  map.showShareButton =
    canManage &&
    canCreateLocationShare({
      consentActive: consentStatus === LOCATION_CONSENT_STATUS.active,
      hasPosition: true,
    });

  return map;
}

export async function getLocalizacaoPage(input?: {
  focus?: string | null;
}): Promise<LocalizacaoPageResult> {
  const copy = familyContent.localizacao;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, reason: "forbidden", message: copy.errors.accessDenied };
    }

    if (!canViewLocation(ctx.role)) {
      return { ok: false, reason: "forbidden", message: copy.errors.accessDenied };
    }

    const shell = await getShellContext();
    const supabase = await createSupabaseServerClient();
    const apelido = shell?.careRecipientDisplayName ?? "Pessoa cuidada";

    const since = new Date();
    since.setDate(since.getDate() - HISTORY_DAYS);

    const [careRecipient, accountRow, latestPoint, safePlaces, geofenceEvents, pointsSince] =
      await Promise.all([
        supabase
          .from("care_recipients")
          .select("geo_consent_at, geo_consent_revoked_at")
          .eq("id", ctx.careRecipientId)
          .single(),
        supabase.from("accounts").select("plan").eq("id", ctx.accountId).single(),
        fetchLatestLocationPoint(supabase, ctx.careRecipientId),
        fetchSafePlacesForCareRecipient(supabase, ctx.careRecipientId),
        fetchGeofenceEventsSince(
          supabase,
          ctx.careRecipientId,
          since.toISOString(),
        ),
        fetchLocationPointsSince(
          supabase,
          ctx.careRecipientId,
          since.toISOString(),
        ),
      ]);

    if (careRecipient.error) throw new Error(careRecipient.error.message);
    if (accountRow.error) throw new Error(accountRow.error.message);

    const consentInput = {
      geoConsentAt: (careRecipient.data.geo_consent_at as string | null) ?? null,
      geoConsentRevokedAt:
        (careRecipient.data.geo_consent_revoked_at as string | null) ?? null,
    };
    const consentStatus = resolveLocationConsent(consentInput);
    const now = new Date();
    const placeCoords = toSafePlaceCoords(safePlaces);

    const consentBanner = (() => {
      if (consentStatus === LOCATION_CONSENT_STATUS.active) {
        const dateLabel = consentInput.geoConsentAt
          ? new Intl.DateTimeFormat("pt-BR", {
              timeZone: TIME_ZONE,
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date(consentInput.geoConsentAt))
          : "";
        return {
          tone: "info" as const,
          title: copy.consent.activeTitle,
          body: copy.consent.activeBody.replace("{data}", dateLabel),
        };
      }
      if (consentStatus === LOCATION_CONSENT_STATUS.revoked) {
        return {
          tone: "warning" as const,
          title: copy.consent.revokedTitle,
          body: copy.consent.revokedBody,
        };
      }
      return {
        tone: "muted" as const,
        title: copy.consent.pendingTitle,
        body: copy.consent.pendingBody,
      };
    })();

    const hasCoords =
      latestPoint?.lat != null && latestPoint?.lng != null;
    const hasText = Boolean(latestPoint?.locationText?.trim());
    const hasPosition = hasCoords || hasText;
    const isFrozen = consentStatus === LOCATION_CONSENT_STATUS.revoked;

    const map = buildMapViewModel({
      copy,
      apelido,
      latestPoint,
      placeCoords,
      consentStatus,
      hasPosition,
      hasCoords,
      hasText,
      isFrozen,
      canManage: canManageSafeZones(ctx.role),
    });

    const lastPoint = latestPoint;
    const stats: LocationStatViewModel[] = [
      {
        label: copy.stats.updated,
        value: lastPoint
          ? formatDateTime(lastPoint.recordedAt).time
          : copy.stats.empty,
        hint: lastPoint
          ? formatRelativeTimeAgo(lastPoint.recordedAt, now, copy.relativeTime)
          : copy.stats.deviceHint,
      },
      {
        label: copy.stats.battery,
        value:
          lastPoint?.batteryPct != null
            ? `${lastPoint.batteryPct}%`
            : copy.stats.empty,
        hint:
          lastPoint?.batteryPct != null
            ? copy.stats.batteryHint.replace("{apelido}", apelido)
            : copy.stats.deviceHint,
      },
      {
        label: copy.stats.permission,
        value:
          lastPoint?.permissionActive === true
            ? copy.stats.permissionActive
            : lastPoint?.permissionActive === false
              ? copy.stats.permissionInactive
              : copy.stats.empty,
        hint:
          lastPoint?.permissionActive != null
            ? copy.stats.permissionHintActive
            : copy.stats.deviceHint,
      },
      {
        label: copy.stats.signal,
        value: lastPoint?.signalQuality ?? copy.stats.empty,
        hint:
          lastPoint?.signalQuality
            ? copy.stats.signalHintOk
            : copy.stats.deviceHint,
      },
    ];

    const currentCoords =
      hasCoords && latestPoint!.lat != null && latestPoint!.lng != null
        ? { lat: latestPoint!.lat, lng: latestPoint!.lng }
        : null;

    const canManage = canManageSafeZones(ctx.role);
    const safePlaceItems: SafePlaceListItem[] = safePlaces.map((place) => {
      const presence = resolvePlacePresence(currentCoords, {
        id: place.id,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        radiusM: place.radiusM,
        coordsConfirmedAt: place.coordsConfirmedAt,
      });

      let tagLabel = copy.places.tagPending;
      let tagTone: "safe" | "warning" | "muted" = "muted";

      if (presence === "inside") {
        tagLabel = copy.places.tagInside;
        tagTone = "safe";
      } else if (presence === "outside" && hasConfirmedHomeCoords(place)) {
        tagLabel = copy.places.tagOutside;
        tagTone = "warning";
      }

      const alertSuffix = place.alertOnExit ? copy.places.alertOnExitSuffix : "";
      const subtitle = hasConfirmedHomeCoords(place)
        ? copy.places.subtitleConfirmed
            .replace("{raio}", String(place.radiusM))
            .replace("{alerta}", alertSuffix)
        : copy.places.subtitlePending;

      return {
        id: place.id,
        name: place.name,
        subtitle,
        icon: resolvePlaceIcon(place.name, place.icon, place.isHome),
        tagLabel,
        tagTone,
        isHome: place.isHome,
        canEdit: canManage,
        canDelete: canManage && !place.isHome,
        alertOnExit: place.alertOnExit,
        alertOnExitDisabled: !hasConfirmedHomeCoords(place),
        addressText: place.addressText ?? "",
        radiusM: place.radiusM,
      };
    });

    const onDemandHistory = pointsSince
      .filter((point) => point.source === "on_demand")
      .map((point) => {
        const dt = formatDateTime(point.recordedAt);
        const precision =
          point.accuracyM != null ? `~${point.accuracyM} m` : copy.history.columns.where;
        return {
          id: point.id,
          whenLabel: `${dt.date} ${dt.time}`,
          whereLabel: precision,
          situationLabel: copy.history.situations.onDemand,
          situationTone: "muted" as const,
          sortAt: point.recordedAt,
        };
      });

    const zoneHistory = geofenceEvents.map((event) => {
      const dt = formatDateTime(event.recordedAt);
      const situation = resolveHistorySituationLabel(event.eventType, {
        safeZone: copy.history.situations.safeZone,
        zoneExit: copy.history.situations.zoneExit,
        returned: copy.history.situations.returned,
      });

      return {
        id: event.id,
        whenLabel: `${dt.date} ${dt.time}`,
        whereLabel: event.placeName,
        situationLabel: situation.label,
        situationTone: situation.tone,
        sortAt: event.recordedAt,
      };
    });

    const history: LocationHistoryItem[] = [...zoneHistory, ...onDemandHistory]
      .sort(
        (a, b) =>
          new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime(),
      )
      .map((item) => ({
        id: item.id,
        whenLabel: item.whenLabel,
        whereLabel: item.whereLabel,
        situationLabel: item.situationLabel,
        situationTone: item.situationTone,
      }));

    const canCreateShare =
      canManage &&
      canCreateLocationShare({
        consentActive: consentStatus === LOCATION_CONSENT_STATUS.active,
        hasPosition,
      });

    const locationRequest = await buildLocationRequestCard({
      copy,
      role: ctx.role,
      accountId: ctx.accountId,
      accountStatus: ctx.accountStatus,
      accountPlan: (accountRow.data.plan as string | null) ?? null,
      careRecipientId: ctx.careRecipientId,
      consentInput,
      supabase,
    });

    return {
      ok: true,
      data: {
        careRecipientId: ctx.careRecipientId,
        careRecipientDisplayName: apelido,
        locationRequest,
        consentStatus,
        consentBanner,
        map,
        stats,
        safePlaces: safePlaceItems,
        canManagePlaces: canManage,
        canCreateShare,
        shareDisabledReason: canCreateShare
          ? null
          : copy.share.disabledReason,
        history,
        historyEmpty: history.length === 0,
        focusAlert: input?.focus === "alert",
      },
    };
  } catch {
    return {
      ok: false,
      reason: "load_failed",
      message: copy.errors.loadFailed,
    };
  }
}

export { familyRoutes };
