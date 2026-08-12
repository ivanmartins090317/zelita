"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { familyContent } from "@/content/family";
import {
  buildSelectedAccountCookieOptions,
  SELECTED_ACCOUNT_COOKIE,
} from "@/modules/accounts/application/account-selection";
import { listUserMemberships } from "@/modules/accounts/application/family-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface SelectAccountResult {
  ok: boolean;
  message?: string;
}

async function persistSelectedAccount(accountId: string) {
  const cookieStore = await cookies();
  const options = buildSelectedAccountCookieOptions(
    process.env.NODE_ENV === "production",
  );
  cookieStore.set(SELECTED_ACCOUNT_COOKIE, accountId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: options.secure,
    maxAge: options.maxAge,
  });
}

/** Troca a conta preferida neste aparelho — valida membership server-side. */
export async function selectAccountAction(
  accountId: string,
): Promise<SelectAccountResult> {
  const trimmed = accountId.trim();
  if (!trimmed) {
    return { ok: false, message: "Escolha uma conta para continuar." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: familyContent.recipientPicker.switchError,
    };
  }

  const memberships = await listUserMemberships(supabase, user.id);
  const selected = memberships.find((item) => item.accountId === trimmed);

  if (!selected) {
    return {
      ok: false,
      message: familyContent.recipientPicker.switchError,
    };
  }

  try {
    await persistSelectedAccount(trimmed);
    revalidatePath("/familia", "layout");
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: familyContent.recipientPicker.switchError,
    };
  }
}
