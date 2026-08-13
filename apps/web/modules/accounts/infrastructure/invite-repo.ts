import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountRole } from "@/modules/accounts/domain/roles";
import type { ParsedInviteContact } from "@/modules/accounts/domain/invite-contact";
import {
  computeInviteExpiresAt,
  generateInviteToken,
} from "@/modules/accounts/domain/invite-lifecycle";

export interface InviteRecord {
  id: string;
  accountId: string;
  careRecipientId: string | null;
  displayName: string;
  relationshipLabel: string | null;
  contactType: "email" | "phone";
  contactValue: string;
  role: AccountRole;
  token: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "revoked";
}

export interface InvitePreview {
  id: string;
  accountId: string;
  displayName: string;
  relationshipLabel: string | null;
  contactType: "email" | "phone";
  contactValue: string;
  role: AccountRole;
  status: InviteRecord["status"];
  expiresAt: string;
  careRecipientDisplayName: string | null;
  inviterName: string | null;
}

function mapInviteRow(row: Record<string, unknown>): InviteRecord {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    careRecipientId: (row.care_recipient_id as string | null) ?? null,
    displayName: row.display_name as string,
    relationshipLabel: (row.relationship_label as string | null) ?? null,
    contactType: row.contact_type as "email" | "phone",
    contactValue: row.contact_value as string,
    role: row.role as AccountRole,
    token: row.token as string,
    expiresAt: row.expires_at as string,
    status: row.status as InviteRecord["status"],
  };
}

export async function insertInvite(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    careRecipientId: string | null;
    displayName: string;
    relationshipLabel?: string | null;
    contact: ParsedInviteContact;
    role: AccountRole;
    invitedBy: string;
    now?: Date;
  },
): Promise<InviteRecord> {
  const now = input.now ?? new Date();
  const token = generateInviteToken();
  const expiresAt = computeInviteExpiresAt(now);

  const { data, error } = await supabase
    .from("invites")
    .insert({
      account_id: input.accountId,
      care_recipient_id: input.careRecipientId,
      display_name: input.displayName.trim(),
      relationship_label: input.relationshipLabel?.trim() || null,
      contact_type: input.contact.type,
      contact_value: input.contact.normalized,
      role: input.role,
      token,
      expires_at: expiresAt.toISOString(),
      status: "pending",
      invited_by: input.invitedBy,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Falha ao criar convite.");
  }

  return mapInviteRow(data);
}

export async function insertExternalEmergencyMember(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    displayName: string;
    relationshipLabel?: string | null;
    contact: ParsedInviteContact;
    role: AccountRole;
  },
): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("account_members")
    .insert({
      account_id: input.accountId,
      profile_id: null,
      role: input.role,
      status: "active",
      display_name: input.displayName.trim(),
      relationship_label: input.relationshipLabel?.trim() || null,
      contact_phone: input.contact.normalized,
      accepted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Falha ao cadastrar contato.");
  }

  return { id: data.id as string };
}

export async function rotateInviteToken(
  supabase: SupabaseClient,
  inviteId: string,
  now: Date = new Date(),
): Promise<InviteRecord> {
  const token = generateInviteToken();
  const expiresAt = computeInviteExpiresAt(now);

  const { data, error } = await supabase
    .from("invites")
    .update({
      token,
      expires_at: expiresAt.toISOString(),
      status: "pending",
      updated_at: now.toISOString(),
    })
    .eq("id", inviteId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Falha ao reenviar convite.");
  }

  return mapInviteRow(data);
}

export async function fetchInviteByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<InvitePreview | null> {
  const { data, error } = await supabase
    .from("invites")
    .select(
      "id, account_id, display_name, relationship_label, contact_type, contact_value, role, status, expires_at, care_recipient_id, invited_by",
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  let careRecipientDisplayName: string | null = null;
  if (data.care_recipient_id) {
    const { data: recipient } = await supabase
      .from("care_recipients")
      .select("display_name")
      .eq("id", data.care_recipient_id as string)
      .maybeSingle();
    careRecipientDisplayName = recipient?.display_name ?? null;
  }

  let inviterName: string | null = null;
  if (data.invited_by) {
    const { data: inviter } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.invited_by as string)
      .maybeSingle();
    inviterName = inviter?.full_name ?? null;
  }

  return {
    id: data.id as string,
    accountId: data.account_id as string,
    displayName: data.display_name as string,
    relationshipLabel: (data.relationship_label as string | null) ?? null,
    contactType: data.contact_type as "email" | "phone",
    contactValue: data.contact_value as string,
    role: data.role as AccountRole,
    status: data.status as InviteRecord["status"],
    expiresAt: data.expires_at as string,
    careRecipientDisplayName,
    inviterName,
  };
}

export async function markInviteExpired(
  supabase: SupabaseClient,
  inviteId: string,
): Promise<void> {
  await supabase
    .from("invites")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("id", inviteId)
    .eq("status", "pending");
}

export async function completeInviteAcceptance(
  supabase: SupabaseClient,
  input: {
    inviteId: string;
    accountId: string;
    profileId: string;
    role: AccountRole;
    contactEmail: string | null;
    displayName: string;
    relationshipLabel: string | null;
  },
): Promise<{ memberId: string }> {
  const now = new Date().toISOString();

  const { data: member, error: memberError } = await supabase
    .from("account_members")
    .insert({
      account_id: input.accountId,
      profile_id: input.profileId,
      role: input.role,
      status: "active",
      display_name: input.displayName,
      contact_email: input.contactEmail,
      relationship_label: input.relationshipLabel,
      invited_at: now,
      accepted_at: now,
    })
    .select("id")
    .single();

  if (memberError || !member) {
    throw new Error(memberError?.message ?? "Falha ao vincular membro.");
  }

  const { error: inviteError } = await supabase
    .from("invites")
    .update({
      status: "accepted",
      accepted_at: now,
      accepted_by: input.profileId,
      member_id: member.id,
      updated_at: now,
    })
    .eq("id", input.inviteId);

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  return { memberId: member.id as string };
}

export async function activeMemberExistsForEmail(
  supabase: SupabaseClient,
  accountId: string,
  email: string,
): Promise<boolean> {
  const { count: storedEmailCount } = await supabase
    .from("account_members")
    .select("*", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("status", "active")
    .ilike("contact_email", email);

  if ((storedEmailCount ?? 0) > 0) return true;

  const { data: members } = await supabase
    .from("account_members")
    .select("profile_id")
    .eq("account_id", accountId)
    .eq("status", "active")
    .not("profile_id", "is", null);

  if (!members?.length) return false;

  for (const row of members) {
    const profileId = row.profile_id as string;
    const { data: userData } = await supabase.auth.admin.getUserById(profileId);
    const userEmail = userData.user?.email?.toLowerCase();
    if (userEmail === email.toLowerCase()) return true;
  }

  return false;
}

export async function activeMemberExistsForPhone(
  supabase: SupabaseClient,
  accountId: string,
  phoneNormalized: string,
): Promise<boolean> {
  const { count } = await supabase
    .from("account_members")
    .select("*", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("status", "active")
    .eq("contact_phone", phoneNormalized);

  return (count ?? 0) > 0;
}
