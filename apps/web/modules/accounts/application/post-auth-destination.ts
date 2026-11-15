import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SELECTED_ACCOUNT_COOKIE } from "@/modules/accounts/application/account-selection";
import { listUserMemberships } from "@/modules/accounts/application/family-context";
import {
  resolvePostLoginRoute,
  type PostLoginRoute,
} from "@/modules/accounts/application/login-routing";

/** Mesmo destino de quem digitou o código: painel, cadastro ou seletor. */
export async function resolvePostAuthDestination(
  supabase: SupabaseClient,
  userId: string,
): Promise<PostLoginRoute> {
  const memberships = await listUserMemberships(supabase, userId);
  const cookieStore = await cookies();
  const savedAccountId =
    cookieStore.get(SELECTED_ACCOUNT_COOKIE)?.value ?? null;

  return resolvePostLoginRoute(
    memberships.map((item) => ({
      accountId: item.accountId,
      careRecipientId: item.careRecipientId,
    })),
    savedAccountId,
  );
}
