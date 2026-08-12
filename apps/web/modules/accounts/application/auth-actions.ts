"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.string().email("Informe um e-mail válido.");

export interface AuthActionResult {
  ok: boolean;
  message?: string;
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

  const mode = String(formData.get("mode") ?? "otp");
  const supabase = await createSupabaseServerClient();
  const email = emailResult.data;

  if (mode === "magiclink") {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    if (error) {
      return {
        ok: false,
        message: `Não foi possível enviar o link: ${error.message}. Verifique Auth no Supabase.`,
      };
    }
    return {
      ok: true,
      message: "Link mágico enviado. Abra o e-mail neste aparelho.",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    return {
      ok: false,
      message: `Não foi possível enviar o código: ${error.message}. Verifique Auth OTP no Supabase.`,
    };
  }
  return {
    ok: true,
    message:
      "Código enviado (válido ~10 min). Reenvio após 45 s invalida o anterior.",
  };
}

export async function verifyEmailOtp(
  _prev: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const emailResult = emailSchema.safeParse(
    String(formData.get("email") ?? "").trim(),
  );
  const token = String(formData.get("token") ?? "").trim();
  if (!emailResult.success) {
    return { ok: false, message: emailResult.error.issues[0]?.message };
  }
  if (!/^\d{6}$/.test(token)) {
    return { ok: false, message: "Informe o código de 6 dígitos." };
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
      message: `Código inválido ou expirado: ${error.message}. Peça um novo código.`,
    };
  }
  redirect("/onboarding");
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
