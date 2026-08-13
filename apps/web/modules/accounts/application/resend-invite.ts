import { buildInviteAcceptUrl } from "@/modules/accounts/domain/invite-lifecycle";
import { rotateInviteToken } from "@/modules/accounts/infrastructure/invite-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ResendInviteInput {
  accountId: string;
  inviteId: string;
  baseUrl?: string;
  now?: Date;
}

export type ResendInviteResult =
  | { ok: true; acceptUrl: string; autoEmailSent: false }
  | { ok: false; message: string };

export async function resendInvite(
  input: ResendInviteInput,
): Promise<ResendInviteResult> {
  const supabase = await createSupabaseServerClient();

  const { data: invite, error } = await supabase
    .from("invites")
    .select("id, account_id, status")
    .eq("id", input.inviteId)
    .eq("account_id", input.accountId)
    .maybeSingle();

  if (error || !invite) {
    return { ok: false, message: "Convite não encontrado." };
  }

  if (invite.status === "accepted") {
    return { ok: false, message: "Este convite já foi aceito." };
  }

  const rotated = await rotateInviteToken(
    supabase,
    input.inviteId,
    input.now ?? new Date(),
  );

  return {
    ok: true,
    acceptUrl: buildInviteAcceptUrl(rotated.token, input.baseUrl),
    autoEmailSent: false,
  };
}
