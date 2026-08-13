import { describe, expect, it, vi, beforeEach } from "vitest";

import { isInviteExpired } from "@/modules/accounts/domain/invite-lifecycle";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/modules/accounts/infrastructure/invite-repo", () => ({
  rotateInviteToken: vi.fn(),
}));

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rotateInviteToken } from "@/modules/accounts/infrastructure/invite-repo";
import { resendInvite } from "./resend-invite";

describe("resendInvite", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: "invite-1", account_id: "acc-1", status: "pending" },
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as never);
  });

  it("rotaciona token e devolve novo link", async () => {
    vi.mocked(rotateInviteToken).mockResolvedValue({
      id: "invite-1",
      accountId: "acc-1",
      careRecipientId: null,
      displayName: "Marcelo",
      relationshipLabel: null,
      contactType: "email",
      contactValue: "marcelo@email.com",
      role: "caregiver",
      token: "novo-token",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "pending",
    });

    const result = await resendInvite({
      accountId: "acc-1",
      inviteId: "invite-1",
      baseUrl: "https://app.zelita.test",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.acceptUrl).toContain("novo-token");
    }
  });

  it("identifica convite expirado pelo prazo", () => {
    expect(
      isInviteExpired("2026-08-01T00:00:00.000Z", new Date("2026-08-13T00:00:00.000Z")),
    ).toBe(true);
  });
});
