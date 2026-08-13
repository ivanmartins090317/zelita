"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { familyContent, familyRoutes } from "@/content/family";
import { acceptInvite } from "@/modules/accounts/application/accept-invite";
import {
  buildSelectedAccountCookieOptions,
  SELECTED_ACCOUNT_COOKIE,
} from "@/modules/accounts/application/account-selection";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AcceptInviteActionResult {
  ok: boolean;
  message?: string;
}

export async function acceptInviteAction(
  _prev: AcceptInviteActionResult,
  formData: FormData,
): Promise<AcceptInviteActionResult> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { ok: false, message: familyContent.participantes.accept.notFoundBody };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`/entrar?retorno=${encodeURIComponent(`/convite/${token}`)}`);
  }

  const result = await acceptInvite({
    token,
    userId: user.id,
    sessionEmail: user.email,
  });

  if (!result.ok) {
    const copy = familyContent.participantes.accept;
    if (result.code === "email_mismatch") {
      return { ok: false, message: copy.emailMismatchBody };
    }
    if (result.code === "expired") {
      return { ok: false, message: copy.expiredBody };
    }
    if (result.code === "already_accepted") {
      return { ok: false, message: copy.alreadyAcceptedBody };
    }
    return { ok: false, message: copy.notFoundBody };
  }

  const cookieStore = await cookies();
  const options = buildSelectedAccountCookieOptions(
    process.env.NODE_ENV === "production",
  );
  cookieStore.set(SELECTED_ACCOUNT_COOKIE, result.accountId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: options.secure,
    maxAge: options.maxAge,
  });

  revalidatePath(familyRoutes.participantes);
  revalidatePath(familyRoutes.hoje);

  redirect(familyRoutes.hoje);
}
