import { describe, expect, it } from "vitest";

import {
  distanceMeters,
  findContainingZone,
  isInsideSafeZone,
  resolveMapZoneTag,
  resolvePlacePresence,
} from "./safe-zone-status";

const home = {
  id: "1",
  name: "Casa",
  lat: -23.55,
  lng: -46.63,
  radiusM: 150,
  coordsConfirmedAt: "2026-08-12T12:00:00.000Z",
};

describe("distanceMeters", () => {
  it("retorna ~0 para o mesmo ponto", () => {
    expect(distanceMeters({ lat: -23.55, lng: -46.63 }, { lat: -23.55, lng: -46.63 })).toBeLessThan(1);
  });
});

describe("isInsideSafeZone", () => {
  it("true dentro do raio", () => {
    expect(
      isInsideSafeZone({ lat: -23.5501, lng: -46.6301 }, home),
    ).toBe(true);
  });

  it("false fora do raio", () => {
    expect(
      isInsideSafeZone({ lat: -23.56, lng: -46.64 }, home),
    ).toBe(false);
  });

  it("false sem coords confirmadas", () => {
    expect(
      isInsideSafeZone(
        { lat: -23.55, lng: -46.63 },
        { ...home, coordsConfirmedAt: null },
      ),
    ).toBe(false);
  });
});

describe("findContainingZone", () => {
  it("encontra Casa quando dentro", () => {
    const zone = findContainingZone({ lat: -23.5501, lng: -46.6301 }, [home]);
    expect(zone?.name).toBe("Casa");
  });

  it("null quando fora de todas", () => {
    expect(findContainingZone({ lat: -23.56, lng: -46.64 }, [home])).toBeNull();
  });
});

describe("resolvePlacePresence", () => {
  it("pending sem coords confirmadas", () => {
    expect(
      resolvePlacePresence(null, { ...home, coordsConfirmedAt: null }),
    ).toBe("pending");
  });

  it("inside quando ponto dentro", () => {
    expect(
      resolvePlacePresence({ lat: -23.5501, lng: -46.6301 }, home),
    ).toBe("inside");
  });
});

describe("resolveMapZoneTag", () => {
  it("safe dentro de Casa", () => {
    expect(
      resolveMapZoneTag({ lat: -23.5501, lng: -46.6301 }, [home]),
    ).toEqual({ tag: "safe", placeName: "Casa" });
  });

  it("outside fora das zonas", () => {
    expect(
      resolveMapZoneTag({ lat: -23.56, lng: -46.64 }, [home]),
    ).toEqual({ tag: "outside", placeName: null });
  });
});
