export const LOCATION_SHARE_DURATION = {
  "1h": "1h",
  "3h": "3h",
  "24h": "24h",
} as const;

export type LocationShareDuration =
  (typeof LOCATION_SHARE_DURATION)[keyof typeof LOCATION_SHARE_DURATION];

export const LOCATION_SHARE_DURATION_MS: Record<LocationShareDuration, number> = {
  "1h": 60 * 60 * 1000,
  "3h": 3 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

export interface LocationShareRecord {
  expiresAt: string;
  revokedAt: string | null;
}

export function resolveShareExpiration(
  duration: LocationShareDuration,
  now = new Date(),
): Date {
  return new Date(now.getTime() + LOCATION_SHARE_DURATION_MS[duration]);
}

export function isLocationShareValid(
  share: LocationShareRecord,
  now = new Date(),
): boolean {
  if (share.revokedAt) return false;
  return new Date(share.expiresAt).getTime() > now.getTime();
}

export function canCreateLocationShare(input: {
  consentActive: boolean;
  hasPosition: boolean;
}): boolean {
  return input.consentActive && input.hasPosition;
}

export function parseLocationShareDuration(
  value: string,
): LocationShareDuration | null {
  if (value === LOCATION_SHARE_DURATION["1h"]) return LOCATION_SHARE_DURATION["1h"];
  if (value === LOCATION_SHARE_DURATION["3h"]) return LOCATION_SHARE_DURATION["3h"];
  if (value === LOCATION_SHARE_DURATION["24h"]) return LOCATION_SHARE_DURATION["24h"];
  return null;
}
