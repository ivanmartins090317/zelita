import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountRole } from "@/modules/accounts/domain/roles";
import { isInviteExpired } from "@/modules/accounts/domain/invite-lifecycle";

export type ParticipantRowKind = "member" | "invite";

export interface ParticipantRowSnapshot {
  id: string;
  kind: ParticipantRowKind;
  displayName: string;
  relationshipLabel: string | null;
  email: string | null;
  phone: string | null;
  role: AccountRole;
  situation: "active" | "pending" | "expired";
  profileId: string | null;
  inviteId: string | null;
  inviteToken: string | null;
  inviteExpiresAt: string | null;
}

interface MemberDbRow {
  id: string;
  profile_id: string | null;
  role: AccountRole;
  status: string;
  display_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  relationship_label: string | null;
  profiles:
    | { full_name: string | null; phone_whatsapp: string | null }
    | { full_name: string | null; phone_whatsapp: string | null }[]
    | null;
}

interface InviteDbRow {
  id: string;
  display_name: string;
  relationship_label: string | null;
  contact_type: "email" | "phone";
  contact_value: string;
  role: AccountRole;
  token: string;
  expires_at: string;
  status: string;
}

function readProfile(
  value: MemberDbRow["profiles"],
): { full_name: string | null; phone_whatsapp: string | null } | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function formatPhoneFromNormalized(normalized: string): string {
  const digits = normalized.startsWith("55")
    ? normalized.slice(2)
    : normalized;
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return normalized;
}

function mapMemberRow(row: MemberDbRow): ParticipantRowSnapshot {
  const profile = readProfile(row.profiles);
  const displayName =
    profile?.full_name?.trim() ||
    row.display_name?.trim() ||
    "Participante";

  return {
    id: row.id,
    kind: "member",
    displayName,
    relationshipLabel: row.relationship_label,
    email: row.contact_email ?? null,
    phone: row.contact_phone ?? profile?.phone_whatsapp ?? null,
    role: row.role,
    situation: row.status === "active" ? "active" : "pending",
    profileId: row.profile_id,
    inviteId: null,
    inviteToken: null,
    inviteExpiresAt: null,
  };
}

function mapInviteRow(row: InviteDbRow, now: Date): ParticipantRowSnapshot {
  const expired =
    row.status === "expired" ||
    (row.status === "pending" && isInviteExpired(row.expires_at, now));

  return {
    id: row.id,
    kind: "invite",
    displayName: row.display_name,
    relationshipLabel: row.relationship_label,
    email: row.contact_type === "email" ? row.contact_value : null,
    phone:
      row.contact_type === "phone"
        ? formatPhoneFromNormalized(row.contact_value)
        : null,
    role: row.role,
    situation: expired ? "expired" : "pending",
    profileId: null,
    inviteId: row.id,
    inviteToken: row.token,
    inviteExpiresAt: row.expires_at,
  };
}

export async function fetchParticipantRows(
  supabase: SupabaseClient,
  accountId: string,
  now: Date = new Date(),
): Promise<ParticipantRowSnapshot[]> {
  const { data: memberRows, error: memberError } = await supabase
    .from("account_members")
    .select(
      "id, profile_id, role, status, display_name, contact_email, contact_phone, relationship_label, profiles(full_name, phone_whatsapp)",
    )
    .eq("account_id", accountId)
    .neq("status", "revoked")
    .order("created_at", { ascending: true });

  if (memberError) {
    throw new Error(memberError.message);
  }

  const { data: inviteRows, error: inviteError } = await supabase
    .from("invites")
    .select(
      "id, display_name, relationship_label, contact_type, contact_value, role, token, expires_at, status",
    )
    .eq("account_id", accountId)
    .in("status", ["pending", "expired"])
    .order("created_at", { ascending: true });

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  const members = (memberRows ?? []).map((row) =>
    mapMemberRow(row as MemberDbRow),
  );
  const invites = (inviteRows ?? []).map((row) =>
    mapInviteRow(row as InviteDbRow, now),
  );

  return [...members, ...invites];
}

export async function findPendingInviteByContact(
  supabase: SupabaseClient,
  accountId: string,
  contactNormalized: string,
): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from("invites")
    .select("id")
    .eq("account_id", accountId)
    .eq("contact_value", contactNormalized)
    .eq("status", "pending")
    .maybeSingle();

  return data ? { id: data.id as string } : null;
}
