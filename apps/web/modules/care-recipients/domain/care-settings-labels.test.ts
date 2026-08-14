import { describe, expect, it } from "vitest";

import {
  LOCATION_CONSENT_STATUS,
  resolveGeoConsentDisplayStatus,
  resolveVoiceChannelStatus,
  resolveWaOptInStatus,
  shouldShowVoiceChannelLine,
  VOICE_CHANNEL_STATUS,
  WA_OPT_IN_STATUS,
} from "./care-settings-labels";
import { SIGNUP_CHANNELS } from "./signup-options";

describe("resolveWaOptInStatus", () => {
  it("marca vigente quando há data de opt-in", () => {
    expect(resolveWaOptInStatus("2026-07-10T12:00:00.000Z")).toBe(
      WA_OPT_IN_STATUS.active,
    );
  });

  it("marca pendente sem opt-in", () => {
    expect(resolveWaOptInStatus(null)).toBe(WA_OPT_IN_STATUS.pending);
  });
});

describe("resolveVoiceChannelStatus", () => {
  it("ativa voz para whatsapp + voz e só ligação", () => {
    expect(resolveVoiceChannelStatus(SIGNUP_CHANNELS.whatsapp_voice)).toBe(
      VOICE_CHANNEL_STATUS.active,
    );
    expect(resolveVoiceChannelStatus(SIGNUP_CHANNELS.voice_only)).toBe(
      VOICE_CHANNEL_STATUS.active,
    );
  });

  it("inativa voz para só WhatsApp", () => {
    expect(resolveVoiceChannelStatus(SIGNUP_CHANNELS.whatsapp)).toBe(
      VOICE_CHANNEL_STATUS.inactive,
    );
  });
});

describe("shouldShowVoiceChannelLine", () => {
  it("omite linha quando canal é só WhatsApp", () => {
    expect(shouldShowVoiceChannelLine(SIGNUP_CHANNELS.whatsapp)).toBe(false);
  });

  it("mostra linha para canais com reforço por voz", () => {
    expect(shouldShowVoiceChannelLine(SIGNUP_CHANNELS.whatsapp_voice)).toBe(
      true,
    );
  });
});

describe("resolveGeoConsentDisplayStatus", () => {
  it("delega revogação vigente para location-consent", () => {
    expect(
      resolveGeoConsentDisplayStatus({
        geoConsentAt: "2026-07-12T10:00:00.000Z",
        geoConsentRevokedAt: "2026-07-15T10:00:00.000Z",
      }),
    ).toBe(LOCATION_CONSENT_STATUS.revoked);
  });

  it("marca pendente sem consentimento", () => {
    expect(
      resolveGeoConsentDisplayStatus({
        geoConsentAt: null,
        geoConsentRevokedAt: null,
      }),
    ).toBe(LOCATION_CONSENT_STATUS.pending);
  });
});
