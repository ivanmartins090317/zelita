import { describe, expect, it } from "vitest";

import {
  canAttemptZoneReading,
  resolveZoneTransition,
  ZONE_TRANSITION,
  type ZoneReadingGate,
} from "./zone-transition";

const READY: ZoneReadingGate = {
  hasAdvancedLocation: true,
  homeConfirmed: true,
  alertOnExit: true,
  consentActive: true,
};

describe("canAttemptZoneReading", () => {
  it("pede leitura só com plano, Casa, aviso e autorização", () => {
    expect(canAttemptZoneReading(READY)).toBe(true);
  });

  it("não pede leitura quando falta uma condição", () => {
    const flags = [
      "hasAdvancedLocation",
      "homeConfirmed",
      "alertOnExit",
      "consentActive",
    ] as const;
    for (const flag of flags) {
      expect(canAttemptZoneReading({ ...READY, [flag]: false })).toBe(false);
    }
  });
});

describe("resolveZoneTransition", () => {
  it("registra saída na passagem de dentro para fora, sem saída em aberto", () => {
    expect(
      resolveZoneTransition({
        gate: READY,
        previousInside: true,
        nextInside: false,
        hasOpenExit: false,
      }),
    ).toBe(ZONE_TRANSITION.exit);
  });

  it("não repete a saída enquanto a pessoa não voltar", () => {
    expect(
      resolveZoneTransition({
        gate: READY,
        previousInside: false,
        nextInside: false,
        hasOpenExit: true,
      }),
    ).toBe(ZONE_TRANSITION.none);
    expect(
      resolveZoneTransition({
        gate: READY,
        previousInside: true,
        nextInside: false,
        hasOpenExit: true,
      }),
    ).toBe(ZONE_TRANSITION.none);
  });

  it("registra a volta quando a leitura nova cai dentro e há saída em aberto", () => {
    expect(
      resolveZoneTransition({
        gate: READY,
        previousInside: false,
        nextInside: true,
        hasOpenExit: true,
      }),
    ).toBe(ZONE_TRANSITION.return);
  });

  it("não registra volta sem saída em aberto", () => {
    expect(
      resolveZoneTransition({
        gate: READY,
        previousInside: false,
        nextInside: true,
        hasOpenExit: false,
      }),
    ).toBe(ZONE_TRANSITION.none);
  });

  it("não registra saída sem leitura anterior dentro do raio", () => {
    expect(
      resolveZoneTransition({
        gate: READY,
        previousInside: false,
        nextInside: false,
        hasOpenExit: false,
      }),
    ).toBe(ZONE_TRANSITION.none);
  });

  it("não registra saída no trial, sem Casa, sem aviso ou sem autorização", () => {
    const blocked: ZoneReadingGate[] = [
      { ...READY, hasAdvancedLocation: false },
      { ...READY, homeConfirmed: false },
      { ...READY, alertOnExit: false },
      { ...READY, consentActive: false },
    ];
    for (const gate of blocked) {
      expect(
        resolveZoneTransition({
          gate,
          previousInside: true,
          nextInside: false,
          hasOpenExit: false,
        }),
      ).toBe(ZONE_TRANSITION.none);
    }
  });
});
