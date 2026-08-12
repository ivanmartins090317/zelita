import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { loginContent } from "@/content/login";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SELECTED_ACCOUNT_COOKIE } from "@/modules/accounts/application/account-selection";
import {
  destinationPathForRoute,
  mapMembershipsToLoginOptions,
  resolvePostLoginRoute,
  type LoginAccountOption,
} from "@/modules/accounts/application/login-routing";
import { listUserMemberships } from "@/modules/accounts/application/family-context";

export interface EntrarPageState {
  kind: "anonymous" | "account-picker";
  accounts?: LoginAccountOption[];
}

export async function resolveEntrarPageState(): Promise<EntrarPageState> {
  if (!isSupabaseConfigured()) {
    return { kind: "anonymous" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { kind: "anonymous" };
    }

    const memberships = await listUserMemberships(supabase, user.id);
    const cookieStore = await cookies();
    const savedAccountId =
      cookieStore.get(SELECTED_ACCOUNT_COOKIE)?.value ?? null;

    const route = resolvePostLoginRoute(
      memberships.map((item) => ({
        accountId: item.accountId,
        careRecipientId: item.careRecipientId,
      })),
      savedAccountId,
    );

    if (route.kind === "picker") {
      return {
        kind: "account-picker",
        accounts: mapMembershipsToLoginOptions(
          memberships,
          loginContent.roleLabels,
        ),
      };
    }

    redirect(destinationPathForRoute(route));
  } catch {
    return { kind: "anonymous" };
  }
}
