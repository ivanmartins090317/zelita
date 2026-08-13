import { describe, expect, it } from "vitest";

import {
  buildExternalMapUrl,
  formatRelativeTimeAgo,
  normalizeMapPinPosition,
  resolveLocationForSos,
  toSafePlaceCoords,
} from "./resolve-location-for-sos";

const home = {
  id: "1",
  name: "Casa",
  lat: -23.55,
  lng: -46.63,
  radiusM: 150,
  coordsConfirmedAt: "2026-08-12T12:00:00.000Z",
};

describe("resolveLocationForSos", () => {
  it("indisponível sem dados", () => {
    expect(
      resolveLocationForSos(
        {
          lat: null,
          lng: null,
          locationText: null,
          safeZoneName: null,
          safePlaces: toSafePlaceCoords([home]),
        },
        { unavailable: "Indisponível", insideZone: "dentro da zona “{zona}”" },
      ),
    ).toEqual({
      locationLine: "Indisponível",
      zoneLine: null,
      hasMapTarget: false,
    });
  });

  it("detecta zona com coords", () => {
    const result = resolveLocationForSos(
      {
        lat: -23.5501,
        lng: -46.6301,
        locationText: "Próximo à Casa",
        safeZoneName: null,
        safePlaces: toSafePlaceCoords([home]),
      },
      { unavailable: "Indisponível", insideZone: "dentro da zona “{zona}”" },
    );
    expect(result.zoneLine).toBe('dentro da zona “Casa”');
    expect(result.hasMapTarget).toBe(true);
  });
});

describe("buildExternalMapUrl", () => {
  it("monta URL OSM com coords", () => {
    expect(buildExternalMapUrl({ lat: -23.55, lng: -46.63 })).toContain(
      "openstreetmap.org",
    );
  });

  it("monta URL com endereço", () => {
    expect(buildExternalMapUrl({ address: "Rua A, 1" })).toContain("search");
  });
});

describe("formatRelativeTimeAgo", () => {
  const labels = {
    justNow: "agora",
    minutes: "há {n} min",
    hours: "há {n} h",
    days: "há {n} d",
  };

  it("formata minutos", () => {
    const now = new Date("2026-08-13T10:30:00.000Z");
    const recorded = "2026-08-13T10:00:00.000Z";
    expect(formatRelativeTimeAgo(recorded, now, labels)).toBe("há 30 min");
  });
});

describe("normalizeMapPinPosition", () => {
  it("retorna percentuais dentro do mapa", () => {
    const pos = normalizeMapPinPosition(-23.55, -46.63, {
      minLat: -23.56,
      maxLat: -23.54,
      minLng: -46.64,
      maxLng: -46.62,
    });
    expect(pos.xPct).toBeGreaterThan(0);
    expect(pos.yPct).toBeGreaterThan(0);
  });
});
