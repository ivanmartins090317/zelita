import {
  SIGNUP_CHANNELS,
  type SignupChannelSlug,
} from "./signup-options";
import {
  LOCATION_CONSENT_STATUS,
  resolveLocationConsent,
  type LocationConsentStatus,
} from "@/modules/location/domain/location-consent";

export const WA_OPT_IN_STATUS = {
  active: "active",
  pending: "pending",
} as const;

export type WaOptInStatus =
  (typeof WA_OPT_IN_STATUS)[keyof typeof WA_OPT_IN_STATUS];

export const VOICE_CHANNEL_STATUS = {
  active: "active",
  inactive: "inactive",
} as const;

export type VoiceChannelStatus =
  (typeof VOICE_CHANNEL_STATUS)[keyof typeof VOICE_CHANNEL_STATUS];

export function resolveWaOptInStatus(
  waOptInAt: string | null,
): WaOptInStatus {
  return waOptInAt ? WA_OPT_IN_STATUS.active : WA_OPT_IN_STATUS.pending;
}

export function resolveVoiceChannelStatus(
  channelPreference: SignupChannelSlug,
): VoiceChannelStatus {
  if (
    channelPreference === SIGNUP_CHANNELS.whatsapp_voice ||
    channelPreference === SIGNUP_CHANNELS.voice_only
  ) {
    return VOICE_CHANNEL_STATUS.active;
  }
  return VOICE_CHANNEL_STATUS.inactive;
}

export function shouldShowVoiceChannelLine(
  channelPreference: SignupChannelSlug,
): boolean {
  return channelPreference !== SIGNUP_CHANNELS.whatsapp;
}

export interface GeoConsentDisplayInput {
  geoConsentAt: string | null;
  geoConsentRevokedAt: string | null;
}

export function resolveGeoConsentDisplayStatus(
  input: GeoConsentDisplayInput,
): LocationConsentStatus {
  return resolveLocationConsent(input);
}

export { LOCATION_CONSENT_STATUS };
