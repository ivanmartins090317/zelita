/**
 * Transição de zona a partir de leituras já classificadas.
 * Quem chama usa `hasConfirmedHomeCoords`, `isInsideSafeZone` e
 * `isLocationConsentActive`. Esta função não recalcula raio nem consentimento.
 */
export const ZONE_TRANSITION = {
  exit: "exit",
  return: "return",
  none: "none",
} as const;

export type ZoneTransitionKind =
  (typeof ZONE_TRANSITION)[keyof typeof ZONE_TRANSITION];

export interface ZoneReadingGate {
  hasAdvancedLocation: boolean;
  homeConfirmed: boolean;
  alertOnExit: boolean;
  consentActive: boolean;
}

/** Abrir o aplicativo só pede GPS quando estas condições estão maduras. */
export function canAttemptZoneReading(gate: ZoneReadingGate): boolean {
  return (
    gate.hasAdvancedLocation &&
    gate.homeConfirmed &&
    gate.alertOnExit &&
    gate.consentActive
  );
}

export function resolveZoneTransition(input: {
  gate: ZoneReadingGate;
  previousInside: boolean;
  nextInside: boolean;
  hasOpenExit: boolean;
}): ZoneTransitionKind {
  if (!canAttemptZoneReading(input.gate)) return ZONE_TRANSITION.none;
  if (input.nextInside && input.hasOpenExit) return ZONE_TRANSITION.return;
  if (input.previousInside && !input.nextInside && !input.hasOpenExit) {
    return ZONE_TRANSITION.exit;
  }
  return ZONE_TRANSITION.none;
}
