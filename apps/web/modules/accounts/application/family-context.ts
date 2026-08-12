import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ACCOUNT_ROLES,
  type AccountRole,
  canManageMedications,
  canViewCareRoutine,
  isAccountPaused,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolveValidSelectedAccountId } from "@/modules/accounts/application/login-routing";
import { SELECTED_ACCOUNT_COOKIE } from "@/modules/accounts/application/account-selection";

export interface FamilyContext {
  userId: string;
  email: string | undefined;
  accountId: string | null;
  role: AccountRole | null;
  accountStatus: AccountStatus | null;
  careRecipientId: string | null;
  profileName: string | null;
}

export interface AccountMembershipSummary {
  accountId: string;
  role: AccountRole;
  accountStatus: AccountStatus;
  careRecipientId: string | null;
  careRecipientDisplayName: string | null;
  careRecipientRelationship: string | null;
  careRecipientBirthDate: string | null;
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

function readAccountStatus(value: unknown): AccountStatus | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0] as { status?: AccountStatus } | undefined;
    return first?.status ?? null;
  }
  return (value as { status?: AccountStatus }).status ?? null;
}

function mapRecipientByAccount(
  rows: Array<{
    id: string;
    account_id: string;
    display_name: string;
    relationship: string | null;
    birth_date: string | null;
  }>,
): Map<
  string,
  {
    id: string;
    display_name: string;
    relationship: string | null;
    birth_date: string | null;
  }
> {
  const map = new Map<
    string,
    {
      id: string;
      display_name: string;
      relationship: string | null;
      birth_date: string | null;
    }
  >();
  for (const row of rows) {
    if (!map.has(row.account_id)) {
      map.set(row.account_id, row);
    }
  }
  return map;
}

export async function listUserMemberships(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountMembershipSummary[]> {
  const { data: memberRows, error } = await supabase
    .from("account_members")
    .select("account_id, role, accounts(status)")
    .eq("profile_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error || !memberRows?.length) {
    return [];
  }

  const accountIds = memberRows.map(
    (row) => row.account_id as string,
  );

  const { data: recipientRows } = await supabase
    .from("care_recipients")
    .select("id, account_id, display_name, relationship, birth_date")
    .in("account_id", accountIds)
    .order("created_at", { ascending: true });

  const recipientByAccount = mapRecipientByAccount(recipientRows ?? []);

  return memberRows.map((row) => {
    const accountId = row.account_id as string;
    const recipient = recipientByAccount.get(accountId);
    return {
      accountId,
      role: row.role as AccountRole,
      accountStatus:
        readAccountStatus(row.accounts) ?? ("active" as AccountStatus),
      careRecipientId: recipient?.id ?? null,
      careRecipientDisplayName: recipient?.display_name ?? null,
      careRecipientRelationship: recipient?.relationship ?? null,
      careRecipientBirthDate: recipient?.birth_date ?? null,
    };
  });
}

function pickMembership(
  memberships: AccountMembershipSummary[],
  savedAccountId: string | null,
): AccountMembershipSummary | null {
  if (memberships.length === 0) return null;

  const accountIds = memberships.map((item) => item.accountId);
  const preferredId = resolveValidSelectedAccountId(
    savedAccountId,
    accountIds,
  );

  if (preferredId) {
    return memberships.find((item) => item.accountId === preferredId) ?? null;
  }

  return memberships[0] ?? null;
}

export async function getFamilyContext(): Promise<FamilyContext> {
  const { supabase, user } = await requireUser();
  const cookieStore = await cookies();
  const savedAccountId =
    cookieStore.get(SELECTED_ACCOUNT_COOKIE)?.value ?? null;

  const memberships = await listUserMemberships(supabase, user.id);
  const membership = pickMembership(memberships, savedAccountId);

  const accountId = membership?.accountId ?? null;
  const role = membership?.role ?? null;
  const accountStatus = membership?.accountStatus ?? null;
  const careRecipientId = membership?.careRecipientId ?? null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email,
    accountId,
    role,
    accountStatus,
    careRecipientId,
    profileName: profile?.full_name ?? null,
  };
}

export async function requireAdminForMedications() {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.role || !canManageMedications(ctx.role)) {
    throw new Error(
      "Só o admin da conta pode cadastrar ou alterar cartelas. Peça ao gestor ou troque de papel.",
    );
  }
  if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
    throw new Error(
      "Conta pausada: dados preservados, mas alterações de remédio ficam bloqueadas até reativar.",
    );
  }
  return ctx;
}

export async function requireRoutineViewer() {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.role || !canViewCareRoutine(ctx.role)) {
    throw new Error(
      "Seu papel não permite ver a rotina de remédios desta conta.",
    );
  }
  return ctx;
}

export { ACCOUNT_ROLES };
