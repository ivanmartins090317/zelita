import { redirect } from "next/navigation";

import {
  ACCOUNT_ROLES,
  type AccountRole,
  canManageMedications,
  canViewCareRoutine,
  isAccountPaused,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface FamilyContext {
  userId: string;
  email: string | undefined;
  accountId: string | null;
  role: AccountRole | null;
  accountStatus: AccountStatus | null;
  careRecipientId: string | null;
  profileName: string | null;
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

export async function getFamilyContext(): Promise<FamilyContext> {
  const { supabase, user } = await requireUser();

  const { data: membership } = await supabase
    .from("account_members")
    .select("account_id, role, accounts(status)")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const accountId = (membership?.account_id as string | undefined) ?? null;
  const role = (membership?.role as AccountRole | undefined) ?? null;
  const accountStatus = readAccountStatus(membership?.accounts);

  let careRecipientId: string | null = null;
  if (accountId) {
    const { data: recipient } = await supabase
      .from("care_recipients")
      .select("id")
      .eq("account_id", accountId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    careRecipientId = recipient?.id ?? null;
  }

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
