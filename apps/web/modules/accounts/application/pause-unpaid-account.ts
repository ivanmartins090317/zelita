import type { SupabaseClient } from "@supabase/supabase-js";

import { ACCOUNT_STATUSES } from "@/modules/accounts/domain/roles";

/** Pausa conta no fim do trial. Não cobra. Service role só em job Inngest. */
export async function pauseUnpaidAccount(
  supabase: SupabaseClient,
  accountId: string,
): Promise<{ ok: boolean; message: string }> {
  const { error } = await supabase
    .from("accounts")
    .update({
      status: ACCOUNT_STATUSES.paused,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .eq("status", ACCOUNT_STATUSES.active);

  if (error) {
    return {
      ok: false,
      message: `Falha ao pausar conta: ${error.message}. Tente de novo no job.`,
    };
  }

  return {
    ok: true,
    message: "Conta pausada ao fim do trial. Sem cobrança automática.",
  };
}
