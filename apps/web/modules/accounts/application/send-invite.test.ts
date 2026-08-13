import { describe, expect, it, vi, beforeEach } from "vitest";

import { sendInvite } from "./send-invite";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
  createSupabaseServiceClient: vi.fn(),
}));

vi.mock("@/modules/accounts/infrastructure/member-list-repo", () => ({
  findPendingInviteByContact: vi.fn(),
}));

vi.mock("@/modules/accounts/infrastructure/invite-repo", () => ({
  activeMemberExistsForEmail: vi.fn(),
  activeMemberExistsForPhone: vi.fn(),
  insertExternalEmergencyMember: vi.fn(),
  insertInvite: vi.fn(),
}));

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { findPendingInviteByContact } from "@/modules/accounts/infrastructure/member-list-repo";
import {
  activeMemberExistsForEmail,
  activeMemberExistsForPhone,
  insertExternalEmergencyMember,
  insertInvite,
} from "@/modules/accounts/infrastructure/invite-repo";

const copy = {
  nameRequired: "Nome obrigatório",
  contactInvalid: "Contato inválido",
  duplicatePending: "Convite pendente",
  duplicateActive: "Já participa",
};

describe("sendInvite", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue({} as never);
    vi.mocked(createSupabaseServiceClient).mockReturnValue({} as never);
  });

  it("rejeita nome vazio", async () => {
    const result = await sendInvite(
      {
        accountId: "acc-1",
        careRecipientId: null,
        invitedBy: "user-1",
        displayName: "   ",
        contactRaw: "ana@email.com",
        role: "caregiver",
      },
      copy,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("name_required");
  });

  it("rejeita contato inválido", async () => {
    const result = await sendInvite(
      {
        accountId: "acc-1",
        careRecipientId: null,
        invitedBy: "user-1",
        displayName: "Ana",
        contactRaw: "invalido",
        role: "caregiver",
      },
      copy,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("contact_invalid");
  });

  it("cadastra emergência só telefone como ativo imediato", async () => {
    vi.mocked(findPendingInviteByContact).mockResolvedValue(null);
    vi.mocked(activeMemberExistsForPhone).mockResolvedValue(false);
    vi.mocked(insertExternalEmergencyMember).mockResolvedValue({ id: "member-1" });

    const result = await sendInvite(
      {
        accountId: "acc-1",
        careRecipientId: null,
        invitedBy: "user-1",
        displayName: "Lúcia",
        contactRaw: "(11) 95555-9090",
        role: "emergency_contact",
      },
      copy,
    );

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.kind).toBe("immediate_emergency");
    expect(insertInvite).not.toHaveBeenCalled();
  });

  it("cria convite pendente para e-mail", async () => {
    vi.mocked(findPendingInviteByContact).mockResolvedValue(null);
    vi.mocked(activeMemberExistsForEmail).mockResolvedValue(false);
    vi.mocked(insertInvite).mockResolvedValue({
      id: "invite-1",
      accountId: "acc-1",
      careRecipientId: null,
      displayName: "Marcelo",
      relationshipLabel: null,
      contactType: "email",
      contactValue: "marcelo@email.com",
      role: "caregiver",
      token: "abc123",
      expiresAt: new Date().toISOString(),
      status: "pending",
    });

    const result = await sendInvite(
      {
        accountId: "acc-1",
        careRecipientId: null,
        invitedBy: "user-1",
        displayName: "Marcelo",
        contactRaw: "marcelo@email.com",
        role: "caregiver",
        baseUrl: "https://app.zelita.test",
      },
      copy,
    );

    expect(result.ok).toBe(true);
    if (result.ok && result.kind === "invite") {
      expect(result.acceptUrl).toContain("/convite/abc123");
    }
  });
});
