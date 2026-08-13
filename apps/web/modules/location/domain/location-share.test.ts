import { describe, expect, it } from "vitest";

import {
  canCreateLocationShare,
  isLocationShareValid,
  LOCATION_SHARE_DURATION,
  parseLocationShareDuration,
  resolveShareExpiration,
} from "./location-share";

describe("resolveShareExpiration", () => {
  it("1h adiciona uma hora", () => {
    const now = new Date("2026-08-13T10:00:00.000Z");
    const exp = resolveShareExpiration(LOCATION_SHARE_DURATION["1h"], now);
    expect(exp.toISOString()).toBe("2026-08-13T11:00:00.000Z");
  });
});

describe("isLocationShareValid", () => {
  it("false quando expirado", () => {
    expect(
      isLocationShareValid(
        { expiresAt: "2026-08-13T09:00:00.000Z", revokedAt: null },
        new Date("2026-08-13T10:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("false quando revogado", () => {
    expect(
      isLocationShareValid(
        {
          expiresAt: "2026-08-13T12:00:00.000Z",
          revokedAt: "2026-08-13T10:30:00.000Z",
        },
        new Date("2026-08-13T10:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("true quando válido", () => {
    expect(
      isLocationShareValid(
        { expiresAt: "2026-08-13T12:00:00.000Z", revokedAt: null },
        new Date("2026-08-13T10:00:00.000Z"),
      ),
    ).toBe(true);
  });
});

describe("canCreateLocationShare", () => {
  it("exige consentimento e posição", () => {
    expect(
      canCreateLocationShare({ consentActive: true, hasPosition: true }),
    ).toBe(true);
    expect(
      canCreateLocationShare({ consentActive: false, hasPosition: true }),
    ).toBe(false);
    expect(
      canCreateLocationShare({ consentActive: true, hasPosition: false }),
    ).toBe(false);
  });
});

describe("parseLocationShareDuration", () => {
  it("aceita durações MVP", () => {
    expect(parseLocationShareDuration("3h")).toBe("3h");
    expect(parseLocationShareDuration("invalid")).toBeNull();
  });
});
