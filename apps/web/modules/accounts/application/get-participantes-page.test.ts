import { describe, expect, it } from "vitest";

import {
  buildParticipantTitle,
  computeInviteExpiresAt,
  INVITE_VALIDITY_DAYS,
} from "@/modules/accounts/domain/invite-lifecycle";

describe("get-participantes-page helpers", () => {
  it("usa sufixo (você) no título da administradora", () => {
    expect(
      buildParticipantTitle({
        displayName: "Cintia",
        relationshipLabel: "filha",
        isSelf: true,
        selfSuffix: " (você)",
      }),
    ).toBe("Cintia (você) · filha");
  });

  it("convite expira em 7 dias", () => {
    const from = new Date("2026-08-13T00:00:00.000Z");
    const expires = computeInviteExpiresAt(from);
    const days = Math.round(
      (expires.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    expect(days).toBe(INVITE_VALIDITY_DAYS);
  });
});
