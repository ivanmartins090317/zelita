import { describe, expect, it } from "vitest";

import {
  canShareLocation,
  isGeoWidgetConfigured,
  isLocationConsentActive,
  LOCATION_CONSENT_STATUS,
  resolveLocationConsent,
} from "./location-consent";

describe("resolveLocationConsent", () => {
  it("pending sem consentimento", () => {
    expect(
      resolveLocationConsent({ geoConsentAt: null, geoConsentRevokedAt: null }),
    ).toBe(LOCATION_CONSENT_STATUS.pending);
  });

  it("active com consentimento", () => {
    expect(
      resolveLocationConsent({
        geoConsentAt: "2026-08-10T10:00:00.000Z",
        geoConsentRevokedAt: null,
      }),
    ).toBe(LOCATION_CONSENT_STATUS.active);
  });

  it("revoked quando revogação posterior", () => {
    expect(
      resolveLocationConsent({
        geoConsentAt: "2026-08-10T10:00:00.000Z",
        geoConsentRevokedAt: "2026-08-11T10:00:00.000Z",
      }),
    ).toBe(LOCATION_CONSENT_STATUS.revoked);
  });
});

describe("canShareLocation", () => {
  it("false quando revogado", () => {
    expect(
      canShareLocation({
        geoConsentAt: "2026-08-10T10:00:00.000Z",
        geoConsentRevokedAt: "2026-08-11T10:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("true quando vigente", () => {
    expect(
      canShareLocation({
        geoConsentAt: "2026-08-10T10:00:00.000Z",
        geoConsentRevokedAt: null,
      }),
    ).toBe(true);
  });
});

describe("isGeoWidgetConfigured", () => {
  it("true com consentimento e Casa endereço", () => {
    expect(
      isGeoWidgetConfigured({
        consent: {
          geoConsentAt: "2026-08-10T10:00:00.000Z",
          geoConsentRevokedAt: null,
        },
        hasLastPosition: false,
        hasHomeAddress: true,
      }),
    ).toBe(true);
  });

  it("false pendente", () => {
    expect(
      isGeoWidgetConfigured({
        consent: { geoConsentAt: null, geoConsentRevokedAt: null },
        hasLastPosition: true,
        hasHomeAddress: true,
      }),
    ).toBe(false);
  });
});

describe("isLocationConsentActive", () => {
  it("espelha resolveLocationConsent active", () => {
    expect(
      isLocationConsentActive({
        geoConsentAt: "2026-08-10T10:00:00.000Z",
        geoConsentRevokedAt: null,
      }),
    ).toBe(true);
  });
});
