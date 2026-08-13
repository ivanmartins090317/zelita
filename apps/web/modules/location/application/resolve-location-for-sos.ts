import type { SafePlaceCoords } from "../domain/safe-zone-status";
import { findContainingZone } from "../domain/safe-zone-status";

export interface ResolveLocationForSosInput {
  lat: number | null;
  lng: number | null;
  locationText: string | null;
  safeZoneName: string | null;
  safePlaces: SafePlaceCoords[];
}

export interface ResolveLocationForSosResult {
  locationLine: string;
  zoneLine: string | null;
  hasMapTarget: boolean;
}

export function toSafePlaceCoords(
  places: Array<{
    id: string;
    name: string;
    lat: number | null;
    lng: number | null;
    radiusM: number;
    coordsConfirmedAt: string | null;
  }>,
): SafePlaceCoords[] {
  return places.map((place) => ({
    id: place.id,
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    radiusM: place.radiusM,
    coordsConfirmedAt: place.coordsConfirmedAt,
  }));
}

export function resolveLocationForSos(
  input: ResolveLocationForSosInput,
  labels: {
    unavailable: string;
    insideZone: string;
  },
): ResolveLocationForSosResult {
  const hasCoords = input.lat != null && input.lng != null;
  const hasText = Boolean(input.locationText?.trim());

  if (!hasCoords && !hasText) {
    return {
      locationLine: labels.unavailable,
      zoneLine: null,
      hasMapTarget: false,
    };
  }

  let zoneName = input.safeZoneName;

  if (hasCoords && input.lat != null && input.lng != null) {
    const zone = findContainingZone(
      { lat: input.lat, lng: input.lng },
      input.safePlaces,
    );
    if (zone) {
      zoneName = zone.name;
    }
  }

  const zoneLine = zoneName
    ? labels.insideZone.replace("{zona}", zoneName)
    : null;

  return {
    locationLine: hasText ? input.locationText!.trim() : labels.unavailable,
    zoneLine,
    hasMapTarget: hasCoords || hasText,
  };
}

export function buildExternalMapUrl(input: {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
}): string | null {
  if (input.lat != null && input.lng != null) {
    return `https://www.openstreetmap.org/?mlat=${input.lat}&mlon=${input.lng}#map=17/${input.lat}/${input.lng}`;
  }
  if (input.address?.trim()) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(input.address.trim())}`;
  }
  return null;
}

export function formatRelativeTimeAgo(
  recordedAt: string,
  now: Date,
  labels: { justNow: string; minutes: string; hours: string; days: string },
): string {
  const diffMs = now.getTime() - new Date(recordedAt).getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return labels.justNow;
  if (diffMin < 60) return labels.minutes.replace("{n}", String(diffMin));

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return labels.hours.replace("{n}", String(diffHours));

  const diffDays = Math.floor(diffHours / 24);
  return labels.days.replace("{n}", String(diffDays));
}

export function normalizeMapPinPosition(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
): { xPct: number; yPct: number } {
  const latSpan = bounds.maxLat - bounds.minLat || 0.01;
  const lngSpan = bounds.maxLng - bounds.minLng || 0.01;

  const xPct = ((lng - bounds.minLng) / lngSpan) * 80 + 10;
  const yPct = ((bounds.maxLat - lat) / latSpan) * 70 + 15;

  return {
    xPct: Math.min(90, Math.max(10, xPct)),
    yPct: Math.min(85, Math.max(15, yPct)),
  };
}
