"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/modules/accounts/application/family-context";
import {
  ACCOUNT_ROLES,
  computeTrialEndsAt,
} from "@/modules/accounts/domain/roles";

const onboardingSchema = z.object({
  managerName: z.string().min(2, "Informe seu nome."),
  managerWhatsapp: z.string().min(8, "Informe seu WhatsApp."),
  careFullName: z.string().min(2, "Informe o nome da pessoa cuidada."),
  careDisplayName: z.string().min(2, "Informe como chamar a pessoa cuidada."),
  careBirthDate: z.string().optional(),
  careRelationship: z.string().optional(),
  careWhatsapp: z.string().min(8, "Informe o WhatsApp da pessoa cuidada."),
  addressText: z.string().min(5, "Informe o endereço de casa."),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  dndStart: z.string().regex(/^\d{2}:\d{2}$/, "DND início no formato HH:MM."),
  dndEnd: z.string().regex(/^\d{2}:\d{2}$/, "DND fim no formato HH:MM."),
});

export interface OnboardingResult {
  ok: boolean;
  message?: string;
}

export async function completeOnboarding(
  _prev: OnboardingResult,
  formData: FormData,
): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse({
    managerName: formData.get("managerName"),
    managerWhatsapp: formData.get("managerWhatsapp"),
    careFullName: formData.get("careFullName"),
    careDisplayName: formData.get("careDisplayName"),
    careBirthDate: formData.get("careBirthDate") || undefined,
    careRelationship: formData.get("careRelationship") || undefined,
    careWhatsapp: formData.get("careWhatsapp"),
    addressText: formData.get("addressText"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    dndStart: formData.get("dndStart"),
    dndEnd: formData.get("dndEnd"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const { supabase, user } = await requireUser();
  const input = parsed.data;

  const { data: existing } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existing?.account_id) {
    redirect("/familia");
  }

  const trialEndsAt = computeTrialEndsAt().toISOString();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .insert({
      plan: "essential",
      status: "active",
      trial_ends_at: trialEndsAt,
    })
    .select("id")
    .single();

  if (accountError || !account) {
    return {
      ok: false,
      message: `Falha ao criar conta: ${accountError?.message ?? "sem retorno"}. Verifique migrations/RLS.`,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: input.managerName,
      phone_whatsapp: input.managerWhatsapp,
    });

  if (profileError) {
    return {
      ok: false,
      message: `Falha ao salvar perfil: ${profileError.message}.`,
    };
  }

  const { error: memberError } = await supabase.from("account_members").insert({
    account_id: account.id,
    profile_id: user.id,
    role: ACCOUNT_ROLES.admin,
    status: "active",
    accepted_at: new Date().toISOString(),
  });

  if (memberError) {
    return {
      ok: false,
      message: `Falha ao vincular membership: ${memberError.message}.`,
    };
  }

  const { data: recipient, error: recipientError } = await supabase
    .from("care_recipients")
    .insert({
      account_id: account.id,
      full_name: input.careFullName,
      display_name: input.careDisplayName,
      birth_date: input.careBirthDate || null,
      relationship: input.careRelationship || null,
      whatsapp: input.careWhatsapp,
      address_text: input.addressText,
      dnd_start: input.dndStart,
      dnd_end: input.dndEnd,
      channel_preference: "whatsapp",
      tone: "carinhoso",
    })
    .select("id")
    .single();

  if (recipientError || !recipient) {
    return {
      ok: false,
      message: `Falha ao cadastrar pessoa cuidada: ${recipientError?.message ?? "sem retorno"}.`,
    };
  }

  const { error: homeError } = await supabase.from("safe_places").insert({
    care_recipient_id: recipient.id,
    name: "Casa",
    address_text: input.addressText,
    lat: input.lat,
    lng: input.lng,
    radius_m: 150,
    is_home: true,
  });

  if (homeError) {
    return {
      ok: false,
      message: `Falha ao registrar Casa: ${homeError.message}. Informe lat/lng válidos.`,
    };
  }

  redirect("/familia");
}
