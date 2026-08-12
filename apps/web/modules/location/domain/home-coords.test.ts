import { describe, expect, it } from "vitest";

import {
  hasConfirmedHomeCoords,
  hasHomeCoords,
} from "./home-coords";

describe("hasHomeCoords", () => {
  it("false quando lat/lng ausentes (Casa pendente no onboarding)", () => {
    expect(hasHomeCoords({ lat: null, lng: null })).toBe(false);
  });

  it("true quando ambos presentes", () => {
    expect(hasHomeCoords({ lat: -23.55, lng: -46.63 })).toBe(true);
  });
});

describe("hasConfirmedHomeCoords", () => {
  it("false sem confirmação mesmo com números", () => {
    expect(
      hasConfirmedHomeCoords({
        lat: -23.55,
        lng: -46.63,
        coordsConfirmedAt: null,
      }),
    ).toBe(false);
  });

  it("true com coords válidas e confirmed_at", () => {
    expect(
      hasConfirmedHomeCoords({
        lat: -23.55,
        lng: -46.63,
        coordsConfirmedAt: "2026-08-12T12:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("false com lat fora do range", () => {
    expect(
      hasConfirmedHomeCoords({
        lat: 91,
        lng: 0,
        coordsConfirmedAt: "2026-08-12T12:00:00.000Z",
      }),
    ).toBe(false);
  });
});
