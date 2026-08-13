import type { AccountRole } from "@/modules/accounts/domain/roles";
import {
  isEmergencyPhoneOnlyInvite,
  parseInviteContact,
} from "@/modules/accounts/domain/invite-contact";
import { buildInviteAcceptUrl } from "@/modules/accounts/domain/invite-lifecycle";
import {
  activeMemberExistsForEmail,
  activeMemberExistsForPhone,
  insertExternalEmergencyMember,
  insertInvite,
} from "@/modules/accounts/infrastructure/invite-repo";
import {
  findPendingInviteByContact,
} from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

export interface SendInviteInput {
  accountId: string;
  careRecipientId: string | null;
  invitedBy: string;
  displayName: string;
  relationshipLabel?: string | null;
  contactRaw: string;
  role: AccountRole;
  baseUrl?: string;
  now?: Date;
}

export type SendInviteResult =
  | {
      ok: true;
      kind: "invite";
      inviteId: string;
      acceptUrl: string;
      autoEmailSent: false;
    }
  | {
      ok: true;
      kind: "immediate_emergency";
      memberId: string;
    }
  | { ok: false; code: string; message: string };

export async function sendInvite(
  input: SendInviteInput,
  copy: {
    nameRequired: string;
    contactInvalid: string;
    duplicatePending: string;
    duplicateActive: string;
  },
): Promise<SendInviteResult> {
  const name = input.displayName.trim();
  if (!name) {
    return { ok: false, code: "name_required", message: copy.nameRequired };
  }

  const contact = parseInviteContact(input.contactRaw);
  if (!contact) {
    return { ok: false, code: "contact_invalid", message: copy.contactInvalid };
  }

  const supabase = await createSupabaseServerClient();
  const service = createSupabaseServiceClient();

  const pending = await findPendingInviteByContact(
    supabase,
    input.accountId,
    contact.normalized,
  );
  if (pending) {
    return {
      ok: false,
      code: "duplicate_pending",
      message: copy.duplicatePending,
    };
  }

  if (contact.type === "email") {
    const exists = await activeMemberExistsForEmail(
      service,
      input.accountId,
      contact.normalized,
    );
    if (exists) {
      return {
        ok: false,
        code: "duplicate_active",
        message: copy.duplicateActive,
      };
    }
  } else {
    const exists = await activeMemberExistsForPhone(
      service,
      input.accountId,
      contact.normalized,
    );
    if (exists) {
      return {
        ok: false,
        code: "duplicate_active",
        message: copy.duplicateActive,
      };
    }
  }

  if (
    isEmergencyPhoneOnlyInvite({
      role: input.role,
      contact,
    })
  ) {
    const member = await insertExternalEmergencyMember(supabase, {
      accountId: input.accountId,
      displayName: name,
      relationshipLabel: input.relationshipLabel,
      contact,
      role: input.role,
    });
    return { ok: true, kind: "immediate_emergency", memberId: member.id };
  }

  const invite = await insertInvite(supabase, {
    accountId: input.accountId,
    careRecipientId: input.careRecipientId,
    displayName: name,
    relationshipLabel: input.relationshipLabel,
    contact,
    role: input.role,
    invitedBy: input.invitedBy,
    now: input.now,
  });

  return {
    ok: true,
    kind: "invite",
    inviteId: invite.id,
    acceptUrl: buildInviteAcceptUrl(invite.token, input.baseUrl),
    autoEmailSent: false,
  };
}
