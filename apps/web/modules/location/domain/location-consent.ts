export const LOCATION_CONSENT_STATUS = {
  pending: "pending",
  active: "active",
  revoked: "revoked",
} as const;

export type LocationConsentStatus =
  (typeof LOCATION_CONSENT_STATUS)[keyof typeof LOCATION_CONSENT_STATUS];

export interface LocationConsentInput {
  geoConsentAt: string | null;
  geoConsentRevokedAt: string | null;
}

export function resolveLocationConsent(
  input: LocationConsentInput,
): LocationConsentStatus {
  if (input.geoConsentRevokedAt) {
    const revoked = new Date(input.geoConsentRevokedAt).getTime();
    const granted = input.geoConsentAt
      ? new Date(input.geoConsentAt).getTime()
      : 0;
    if (revoked >= granted) {
      return LOCATION_CONSENT_STATUS.revoked;
    }
  }

  if (input.geoConsentAt) {
    return LOCATION_CONSENT_STATUS.active;
  }

  return LOCATION_CONSENT_STATUS.pending;
}

export function isLocationConsentActive(input: LocationConsentInput): boolean {
  return resolveLocationConsent(input) === LOCATION_CONSENT_STATUS.active;
}

export function canShareLocation(input: LocationConsentInput): boolean {
  return isLocationConsentActive(input);
}

export function isGeoWidgetConfigured(input: {
  consent: LocationConsentInput;
  hasLastPosition: boolean;
  hasHomeAddress: boolean;
}): boolean {
  const status = resolveLocationConsent(input.consent);
  if (status === LOCATION_CONSENT_STATUS.active) {
    return input.hasLastPosition || input.hasHomeAddress;
  }
  return false;
}
