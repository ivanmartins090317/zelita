import { familyContent } from "@/content/family";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

import { isLocationShareValid } from "../domain/location-share";
import { fetchLatestLocationPoint } from "../infrastructure/location-point-repo";
import { fetchLocationShareByToken } from "../infrastructure/location-share-repo";
import {
  buildExternalMapUrl,
  normalizeMapPinPosition,
} from "./resolve-location-for-sos";

export interface LocationSharePageViewModel {
  state: "ready" | "expired" | "invalid";
  title?: string;
  timeLabel?: string;
  addressOnly?: string | null;
  pinPosition?: { xPct: number; yPct: number } | null;
  externalMapUrl?: string | null;
  privacyNote?: string;
}

const TIME_ZONE = "America/Sao_Paulo";

function defaultMapBounds(lat: number, lng: number) {
  return {
    minLat: lat - 0.008,
    maxLat: lat + 0.008,
    minLng: lng - 0.008,
    maxLng: lng + 0.008,
  };
}

export async function getLocationSharePage(
  token: string,
): Promise<LocationSharePageViewModel> {
  const copy = familyContent.localizacao.sharePublic;

  try {
    const supabase = createSupabaseServiceClient();
    const link = await fetchLocationShareByToken(supabase, token);

    if (!link || !isLocationShareValid(link)) {
      return { state: "expired" };
    }

    const latest = await fetchLatestLocationPoint(supabase, link.careRecipientId);
    if (!latest) {
      return { state: "invalid" };
    }

    const timeLabel = new Intl.DateTimeFormat("pt-BR", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(latest.recordedAt));

    const hasCoords = latest.lat != null && latest.lng != null;

    return {
      state: "ready",
      title: copy.title,
      timeLabel,
      addressOnly: hasCoords ? null : latest.locationText,
      pinPosition:
        hasCoords && latest.lat != null && latest.lng != null
          ? normalizeMapPinPosition(
              latest.lat,
              latest.lng,
              defaultMapBounds(latest.lat, latest.lng),
            )
          : null,
      externalMapUrl: buildExternalMapUrl({
        lat: latest.lat,
        lng: latest.lng,
        address: latest.locationText,
      }),
      privacyNote: copy.privacyNote,
    };
  } catch {
    return { state: "invalid" };
  }
}
