import { describe, expect, it } from "vitest";

import {
  buildParticipantSubtitle,
  buildParticipantTitle,
  computeInviteExpiresAt,
  INVITE_VALIDITY_DAYS,
  isInviteExpired,
} from "./invite-lifecycle";

describe("invite-lifecycle", () => {
  it("calcula expiração em 7 dias", () => {
    const from = new Date("2026-08-13T12:00:00.000Z");
    const expires = computeInviteExpiresAt(from);
    const diffDays = Math.round(
      (expires.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    expect(diffDays).toBe(INVITE_VALIDITY_DAYS);
  });

  it("detecta convite expirado", () => {
    const past = new Date("2026-08-01T00:00:00.000Z");
    expect(isInviteExpired(past, new Date("2026-08-13T00:00:00.000Z"))).toBe(
      true,
    );
    const future = new Date("2026-08-20T00:00:00.000Z");
    expect(isInviteExpired(future, new Date("2026-08-13T00:00:00.000Z"))).toBe(
      false,
    );
  });

  it("monta título e subtítulo de participante", () => {
    expect(
      buildParticipantTitle({
        displayName: "Cintia Rodrigues",
        relationshipLabel: "filha",
        isSelf: true,
        selfSuffix: " (você)",
      }),
    ).toBe("Cintia Rodrigues (você) · filha");

    expect(
      buildParticipantSubtitle({
        email: "cintia@email.com",
        phone: "(11) 98888-1234",
      }),
    ).toBe("cintia@email.com · (11) 98888-1234");
  });
});
