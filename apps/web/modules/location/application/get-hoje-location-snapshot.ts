import { familyContent, familyRoutes } from "@/content/family";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  isGeoWidgetConfigured,
  resolveLocationConsent,
} from "../domain/location-consent";
import { resolveMapZoneTag } from "../domain/safe-zone-status";
import { fetchLatestLocationPoint } from "../infrastructure/location-point-repo";
import { fetchHomePlace, fetchSafePlacesForCareRecipient } from "../infrastructure/safe-place-repo";
import { toSafePlaceCoords } from "./resolve-location-for-sos";

const TIME_ZONE = "America/Sao_Paulo";

export interface HojeLocationStat {
  value: string;
  hint: string;
  href: string;
}

export interface HojeLocationSnapshot {
  geoWidgetConfigured: boolean;
  geoWidgetStatus: string;
  locationStat: HojeLocationStat | null;
  timelineItems: Array<{
    timeLabel: string;
    title: string;
    subtitle: string;
    variant: "default" | "warning";
    href: string;
    linkLabel: string;
    sortKey: number;
  }>;
}

function formatTimeLabel(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export async function getHojeLocationSnapshot(input: {
  careRecipientId: string;
  geoConsentAt: string | null;
  geoConsentRevokedAt: string | null;
  now?: Date;
}): Promise<HojeLocationSnapshot> {
  const copy = familyContent.localizacao.hoje;
  const supabase = await createSupabaseServerClient();

  const [latestPoint, safePlaces, homePlace] = await Promise.all([
    fetchLatestLocationPoint(supabase, input.careRecipientId),
    fetchSafePlacesForCareRecipient(supabase, input.careRecipientId),
    fetchHomePlace(supabase, input.careRecipientId),
  ]);

  const consent = {
    geoConsentAt: input.geoConsentAt,
    geoConsentRevokedAt: input.geoConsentRevokedAt,
  };

  const hasLastPosition = Boolean(
    latestPoint &&
      (latestPoint.lat != null ||
        latestPoint.lng != null ||
        latestPoint.locationText),
  );

  const geoWidgetConfigured = isGeoWidgetConfigured({
    consent,
    hasLastPosition,
    hasHomeAddress: Boolean(homePlace?.addressText?.trim()),
  });

  let locationStat: HojeLocationStat | null = null;

  if (latestPoint && resolveLocationConsent(consent) !== "pending") {
    const coords =
      latestPoint.lat != null && latestPoint.lng != null
        ? { lat: latestPoint.lat, lng: latestPoint.lng }
        : null;
    const zone = coords
      ? resolveMapZoneTag(coords, toSafePlaceCoords(safePlaces))
      : { tag: "none" as const, placeName: null };

    const value =
      zone.tag === "safe" && zone.placeName
        ? zone.placeName
        : zone.tag === "outside"
          ? copy.statOutside
          : latestPoint.locationText ?? copy.statUnavailable;

    locationStat = {
      value,
      hint: copy.statHint.replace(
        "{hora}",
        formatTimeLabel(latestPoint.recordedAt),
      ),
      href: familyRoutes.localizacao,
    };
  }

  return {
    geoWidgetConfigured,
    geoWidgetStatus: geoWidgetConfigured
      ? copy.widgetConfigured
      : copy.widgetPending,
    locationStat,
    timelineItems: [],
  };
}
