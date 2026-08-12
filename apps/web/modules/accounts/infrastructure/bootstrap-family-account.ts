import type { SupabaseClient } from "@supabase/supabase-js";

export interface BootstrapFamilyAccountInput {
  plan?: string;
  trialEndsAt?: string | null;
}

export interface BootstrapFamilyAccountResult {
  accountId: string | null;
  errorMessage: string | null;
}

/**
 * Cria accounts + membership admin via RPC SECURITY DEFINER.
 * Não usa service_role: auth.uid() vem da sessão do client autenticado.
 */
export async function bootstrapFamilyAccount(
  supabase: SupabaseClient,
  input: BootstrapFamilyAccountInput = {},
): Promise<BootstrapFamilyAccountResult> {
  const { data, error } = await supabase.rpc("bootstrap_family_account", {
    p_plan: input.plan ?? "essential",
    p_trial_ends_at: input.trialEndsAt ?? null,
  });

  if (error) {
    return {
      accountId: null,
      errorMessage: error.message,
    };
  }

  if (typeof data !== "string" || !data) {
    return {
      accountId: null,
      errorMessage: "RPC bootstrap_family_account não retornou account_id.",
    };
  }

  return { accountId: data, errorMessage: null };
}
