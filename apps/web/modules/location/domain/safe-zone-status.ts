import { hasConfirmedHomeCoords } from "./home-coords";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface SafePlaceCoords {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  radiusM: number;
  coordsConfirmedAt?: string | null;
}

const EARTH_RADIUS_M = 6_371_000;

/** Distância em metros entre dois pontos (Haversine). */
export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function isInsideSafeZone(
  point: GeoPoint,
  place: Pick<SafePlaceCoords, "lat" | "lng" | "radiusM" | "coordsConfirmedAt">,
): boolean {
  if (place.lat == null || place.lng == null) return false;
  if (!hasConfirmedHomeCoords(place)) return false;
  return distanceMeters(point, { lat: place.lat, lng: place.lng }) <= place.radiusM;
}

export function findContainingZone(
  point: GeoPoint,
  places: SafePlaceCoords[],
): SafePlaceCoords | null {
  for (const place of places) {
    if (isInsideSafeZone(point, place)) return place;
  }
  return null;
}

export type ZonePresenceStatus = "inside" | "outside" | "pending";

export function resolvePlacePresence(
  point: GeoPoint | null,
  place: SafePlaceCoords,
): ZonePresenceStatus {
  if (!hasConfirmedHomeCoords(place)) return "pending";
  if (!point) return "outside";
  return isInsideSafeZone(point, place) ? "inside" : "outside";
}

export type MapZoneTag = "safe" | "outside" | "none";

export function resolveMapZoneTag(
  point: GeoPoint | null,
  places: SafePlaceCoords[],
): { tag: MapZoneTag; placeName: string | null } {
  if (!point) return { tag: "none", placeName: null };
  const zone = findContainingZone(point, places);
  if (zone) return { tag: "safe", placeName: zone.name };
  return { tag: "outside", placeName: null };
}
