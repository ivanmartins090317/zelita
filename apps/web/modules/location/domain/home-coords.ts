export interface HomePlaceCoords {
  lat: number | null;
  lng: number | null;
  coordsConfirmedAt?: string | null;
}

/** True quando Casa tem lat/lng e confirmação (alerta de zona pode ligar). */
export function hasConfirmedHomeCoords(place: HomePlaceCoords): boolean {
  if (place.lat == null || place.lng == null) return false;
  if (place.lat < -90 || place.lat > 90) return false;
  if (place.lng < -180 || place.lng > 180) return false;
  return Boolean(place.coordsConfirmedAt);
}

/** True se há lat/lng gravados (mesmo sem confirmação formal). */
export function hasHomeCoords(
  place: Pick<HomePlaceCoords, "lat" | "lng">,
): boolean {
  return place.lat != null && place.lng != null;
}
