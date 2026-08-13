import { describe, expect, it, vi, beforeEach } from "vitest";

import { isInviteExpired } from "@/modules/accounts/domain/invite-lifecycle";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServiceClient: vi.fn(),
}));

vi.mock("@/modules/accounts/infrastructure/invite-repo", () => ({
  fetchInviteByToken: vi.fn(),
  markInviteExpired: vi.fn(),
  completeInviteAcceptance: vi.fn(),
}));

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  completeInviteAcceptance,
  fetchInviteByToken,
  markInviteExpired,
} from "@/modules/accounts/infrastructure/invite-repo";
import { acceptInvite, getAcceptInvitePreview } from "./accept-invite";

describe("accept-invite", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServiceClient).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    } as never);
  });

  it("preview retorna expirado após 7 dias", async () => {
    vi.mocked(fetchInviteByToken).mockResolvedValue({
      id: "invite-1",
      accountId: "acc-1",
      displayName: "Paula",
      relationshipLabel: null,
      contactType: "email",
      contactValue: "paula@email.com",
      role: "viewer",
      status: "pending",
      expiresAt: "2026-08-01T00:00:00.000Z",
      careRecipientDisplayName: "Seu João",
      inviterName: "Cintia",
    });

    const preview = await getAcceptInvitePreview({
      token: "token",
      now: new Date("2026-08-13T00:00:00.000Z"),
    });

    expect(preview.ok).toBe(true);
    if (preview.ok) expect(preview.state).toBe("expired");
    expect(markInviteExpired).toHaveBeenCalled();
  });

  it("aceita convite quando e-mail coincide", async () => {
    vi.mocked(fetchInviteByToken).mockResolvedValue({
      id: "invite-1",
      accountId: "acc-1",
      displayName: "Paula",
      relationshipLabel: "neta",
      contactType: "email",
      contactValue: "paula@email.com",
      role: "viewer",
      status: "pending",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      careRecipientDisplayName: "Seu João",
      inviterName: "Cintia",
    });

    const result = await acceptInvite({
      token: "token",
      userId: "user-1",
      sessionEmail: "paula@email.com",
    });

    expect(result.ok).toBe(true);
    expect(completeInviteAcceptance).toHaveBeenCalled();
  });

  it("rejeita e-mail diferente da sessão", async () => {
    vi.mocked(fetchInviteByToken).mockResolvedValue({
      id: "invite-1",
      accountId: "acc-1",
      displayName: "Paula",
      relationshipLabel: null,
      contactType: "email",
      contactValue: "paula@email.com",
      role: "viewer",
      status: "pending",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      careRecipientDisplayName: "Seu João",
      inviterName: "Cintia",
    });

    const result = await acceptInvite({
      token: "token",
      userId: "user-2",
      sessionEmail: "outro@email.com",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("email_mismatch");
  });

  it("isInviteExpired respeita prazo de 7 dias", () => {
    expect(isInviteExpired("2026-08-06T00:00:00.000Z", new Date("2026-08-13T00:00:01.000Z"))).toBe(
      true,
    );
  });
});
