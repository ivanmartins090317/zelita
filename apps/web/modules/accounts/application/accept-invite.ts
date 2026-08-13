import { isInviteExpired } from "@/modules/accounts/domain/invite-lifecycle";
import {
  completeInviteAcceptance,
  fetchInviteByToken,
  markInviteExpired,
} from "@/modules/accounts/infrastructure/invite-repo";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type AcceptInvitePreviewResult =
  | {
      ok: true;
      state: "ready";
      inviteId: string;
      accountId: string;
      role: string;
      careRecipientDisplayName: string | null;
      inviterName: string | null;
      invitedEmail: string;
      sessionEmail: string | null;
      isAuthenticated: boolean;
      emailMatches: boolean;
    }
  | { ok: true; state: "expired" }
  | { ok: true; state: "already_accepted" }
  | { ok: false; state: "not_found" };

export async function getAcceptInvitePreview(input: {
  token: string;
  sessionEmail?: string | null;
  now?: Date;
}): Promise<AcceptInvitePreviewResult> {
  const service = createSupabaseServiceClient();
  const invite = await fetchInviteByToken(service, input.token);

  if (!invite) {
    return { ok: false, state: "not_found" };
  }

  if (invite.status === "accepted") {
    return { ok: true, state: "already_accepted" };
  }

  const now = input.now ?? new Date();
  if (
    invite.status === "expired" ||
    isInviteExpired(invite.expiresAt, now)
  ) {
    if (invite.status === "pending") {
      await markInviteExpired(service, invite.id);
    }
    return { ok: true, state: "expired" };
  }

  if (invite.contactType !== "email") {
    return { ok: false, state: "not_found" };
  }

  const sessionEmail = input.sessionEmail?.toLowerCase() ?? null;
  const invitedEmail = invite.contactValue.toLowerCase();

  return {
    ok: true,
    state: "ready",
    inviteId: invite.id,
    accountId: invite.accountId,
    role: invite.role,
    careRecipientDisplayName: invite.careRecipientDisplayName,
    inviterName: invite.inviterName,
    invitedEmail,
    sessionEmail,
    isAuthenticated: Boolean(sessionEmail),
    emailMatches: Boolean(sessionEmail && sessionEmail === invitedEmail),
  };
}

export type AcceptInviteResult =
  | { ok: true; accountId: string }
  | { ok: false; code: string; message: string };

export async function acceptInvite(input: {
  token: string;
  userId: string;
  sessionEmail: string;
  now?: Date;
}): Promise<AcceptInviteResult> {
  const service = createSupabaseServiceClient();
  const invite = await fetchInviteByToken(service, input.token);

  if (!invite) {
    return {
      ok: false,
      code: "not_found",
      message: "Convite não encontrado.",
    };
  }

  if (invite.status === "accepted") {
    return {
      ok: false,
      code: "already_accepted",
      message: "Este convite já foi aceito.",
    };
  }

  const now = input.now ?? new Date();
  if (
    invite.status === "expired" ||
    isInviteExpired(invite.expiresAt, now)
  ) {
    if (invite.status === "pending") {
      await markInviteExpired(service, invite.id);
    }
    return {
      ok: false,
      code: "expired",
      message: "Convite expirado.",
    };
  }

  if (invite.contactType !== "email") {
    return {
      ok: false,
      code: "not_found",
      message: "Convite não encontrado.",
    };
  }

  const invitedEmail = invite.contactValue.toLowerCase();
  const sessionEmail = input.sessionEmail.toLowerCase();

  if (invitedEmail !== sessionEmail) {
    return {
      ok: false,
      code: "email_mismatch",
      message: "E-mail da sessão diferente do convite.",
    };
  }

  const { data: existingMember } = await service
    .from("account_members")
    .select("id")
    .eq("account_id", invite.accountId)
    .eq("profile_id", input.userId)
    .eq("status", "active")
    .maybeSingle();

  if (existingMember) {
    await service
      .from("invites")
      .update({
        status: "accepted",
        accepted_at: now.toISOString(),
        accepted_by: input.userId,
        member_id: existingMember.id,
        updated_at: now.toISOString(),
      })
      .eq("id", invite.id);

    return { ok: true, accountId: invite.accountId };
  }

  await completeInviteAcceptance(service, {
    inviteId: invite.id,
    accountId: invite.accountId,
    profileId: input.userId,
    role: invite.role,
    contactEmail: invitedEmail,
    displayName: invite.displayName,
    relationshipLabel: invite.relationshipLabel,
  });

  return { ok: true, accountId: invite.accountId };
}
