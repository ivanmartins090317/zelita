/** Localização — API pública estreita do módulo. */

export {
  hasConfirmedHomeCoords,
  hasHomeCoords,
  type HomePlaceCoords,
} from "./domain/home-coords";

export { canViewLocation } from "./domain/can-view-location";
export { canManageSafeZones } from "./domain/can-manage-safe-zones";
export {
  resolveLocationConsent,
  isLocationConsentActive,
  isGeoWidgetConfigured,
  LOCATION_CONSENT_STATUS,
  type LocationConsentStatus,
} from "./domain/location-consent";
export {
  findContainingZone,
  isInsideSafeZone,
  resolveMapZoneTag,
  type SafePlaceCoords,
} from "./domain/safe-zone-status";
export {
  resolveLocationForSos,
  buildExternalMapUrl,
  toSafePlaceCoords,
} from "./application/resolve-location-for-sos";

export { getLocalizacaoPage } from "./application/get-localizacao-page";
export { getHojeLocationSnapshot } from "./application/get-hoje-location-snapshot";
export { getLocationSharePage } from "./application/get-location-share-page";
export { confirmHomeFromDeviceAction } from "./application/confirm-home-from-device";
export { createLocationRequestAction } from "./application/request-device-location";
export {
  recordForegroundPositionAction,
  shouldReadForegroundPositionAction,
} from "./application/record-foreground-position";

export { LOCATION_CONSTANTS } from "./constants";

export const locationModule = {
  id: "location",
} as const;
