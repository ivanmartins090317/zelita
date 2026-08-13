"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { loginContent } from "@/content/login";
import { signupContent } from "@/content/signup";
import {
  buildSelectedAccountCookieOptions,
  SELECTED_ACCOUNT_COOKIE,
} from "@/modules/accounts/application/account-selection";
import {
  destinationPathForRoute,
  mapMembershipsToLoginOptions,
  resolvePostLoginRoute,
  type LoginAccountOption,
} from "@/modules/accounts/application/login-routing";
import { listUserMemberships } from "@/modules/accounts/application/family-context";
import { resolveSignupOtpOutcome } from "@/modules/care-recipients/application/signup-routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ACCESS_CODE_LENGTH,
  ACCESS_CODE_MAX_LENGTH,
} from "@/lib/format";

const emailSchema = z.string().email(loginContent.messages.emailInvalid);

export interface AuthActionResult {
  ok: boolean;
  message?: string;
  invalidCode?: boolean;
}

export type { LoginAccountOption };

export type VerifyEmailOtpResult =
  | AuthActionResult
  | { ok: true; needsAccountPicker: true; accounts: LoginAccountOption[] };

export type VerifySignupOtpResult =
  | AuthActionResult
  | { ok: true; needsAccountPicker: true; accounts: LoginAccountOption[] }
  | { ok: true; continueSignup: true }
  | { ok: true; signupAlreadyComplete: true; accountId: string | null };

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

async function routeAfterAuth(userId: string): Promise<
  | { needsAccountPicker: true; accounts: LoginAccountOption[] }
  | null
> {
  const supabase = await createSupabaseServerClient();
  const memberships = await listUserMemberships(supabase, userId);
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
      needsAccountPicker: true,
      accounts: mapMembershipsToLoginOptions(
        memberships,
        loginContent.roleLabels,
      ),
    };
  }

  if (route.accountId) {
    await persistSelectedAccount(route.accountId);
  }

  redirect(destinationPathForRoute(route));
}

export async function requestEmailOtp(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const emailResult = emailSchema.safeParse(
    String(formData.get("email") ?? "").trim(),
  );
  if (!emailResult.success) {
    return { ok: false, message: emailResult.error.issues[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: emailResult.data,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { ok: false, message: loginContent.messages.codeSendFailure };
  }

  return { ok: true, message: loginContent.messages.codeSendSuccess };
}

export async function verifyEmailOtp(
  _prev: AuthActionResult | VerifyEmailOtpResult,
  formData: FormData,
): Promise<VerifyEmailOtpResult> {
  const emailResult = emailSchema.safeParse(
    String(formData.get("email") ?? "").trim(),
  );
  const token = String(formData.get("token") ?? "")
    .trim()
    .replace(/\s+/g, "");

  if (!emailResult.success) {
    return { ok: false, message: emailResult.error.issues[0]?.message };
  }

  const codePattern = new RegExp(
    `^\\d{${ACCESS_CODE_LENGTH},${ACCESS_CODE_MAX_LENGTH}}$`,
  );
  if (!codePattern.test(token)) {
    return {
      ok: false,
      message: loginContent.code.incompleteCodeError,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: emailResult.data,
    token,
    type: "email",
  });

  if (error) {
    return {
      ok: false,
      message: loginContent.messages.codeInvalidGeneric,
      invalidCode: true,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: loginContent.messages.verifyFailure };
  }

  const returnTo = String(formData.get("returnTo") ?? "").trim();
  if (returnTo.startsWith("/convite/")) {
    redirect(returnTo);
  }

  const pickerResult = await routeAfterAuth(user.id);
  if (pickerResult) {
    return {
      ok: true,
      needsAccountPicker: true,
      accounts: pickerResult.accounts,
    };
  }

  return { ok: false, message: loginContent.messages.verifyFailure };
}

export async function verifySignupOtp(
  _prev: AuthActionResult | VerifySignupOtpResult,
  formData: FormData,
): Promise<VerifySignupOtpResult> {
  const emailResult = emailSchema.safeParse(
    String(formData.get("email") ?? "").trim(),
  );
  const token = String(formData.get("token") ?? "")
    .trim()
    .replace(/\s+/g, "");

  if (!emailResult.success) {
    return { ok: false, message: emailResult.error.issues[0]?.message };
  }

  const codePattern = new RegExp(
    `^\\d{${ACCESS_CODE_LENGTH},${ACCESS_CODE_MAX_LENGTH}}$`,
  );
  if (!codePattern.test(token)) {
    return {
      ok: false,
      message: signupContent.code.incompleteCodeError,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: emailResult.data,
    token,
    type: "email",
  });

  if (error) {
    return {
      ok: false,
      message: signupContent.messages.codeInvalidGeneric,
      invalidCode: true,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: signupContent.messages.codeSendFailure };
  }

  const memberships = await listUserMemberships(supabase, user.id);
  const outcome = resolveSignupOtpOutcome(
    memberships.map((item) => ({
      accountId: item.accountId,
      careRecipientId: item.careRecipientId,
    })),
  );

  if (outcome.kind === "continue") {
    if (outcome.accountId) {
      await persistSelectedAccount(outcome.accountId);
    }
    return { ok: true, continueSignup: true };
  }

  if (outcome.kind === "already_complete") {
    if (outcome.accountId) {
      await persistSelectedAccount(outcome.accountId);
    }
    return {
      ok: true,
      signupAlreadyComplete: true,
      accountId: outcome.accountId,
    };
  }

  return {
    ok: true,
    needsAccountPicker: true,
    accounts: mapMembershipsToLoginOptions(
      memberships.filter((item) => item.careRecipientId),
      loginContent.roleLabels,
    ),
  };
}

export async function selectLoginAccount(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const accountId = String(formData.get("accountId") ?? "").trim();
  if (!accountId) {
    return { ok: false, message: "Escolha uma conta para continuar." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const memberships = await listUserMemberships(supabase, user.id);
  const selected = memberships.find((item) => item.accountId === accountId);

  if (!selected) {
    return {
      ok: false,
      message: "Esta conta não está disponível para você. Escolha outra.",
    };
  }

  await persistSelectedAccount(accountId);

  const route = resolvePostLoginRoute(
    [
      {
        accountId: selected.accountId,
        careRecipientId: selected.careRecipientId,
      },
    ],
    accountId,
  );

  redirect(destinationPathForRoute(route));
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
