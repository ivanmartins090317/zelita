"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/modules/accounts/application/family-context";
import { computeTrialEndsAt } from "@/modules/accounts/domain/roles";
import { bootstrapFamilyAccount } from "@/modules/accounts/infrastructure/bootstrap-family-account";
import { LOCATION_CONSTANTS } from "@/modules/location";

const onboardingSchema = z.object({
  managerName: z.string().min(2, "Informe seu nome."),
  managerWhatsapp: z.string().min(8, "Informe seu WhatsApp."),
  careFullName: z.string().min(2, "Informe o nome da pessoa cuidada."),
  careDisplayName: z.string().min(2, "Informe como chamar a pessoa cuidada."),
  careBirthDate: z.string().optional(),
  careRelationship: z.string().optional(),
  careWhatsapp: z.string().min(8, "Informe o WhatsApp da pessoa cuidada."),
  addressText: z.string().min(5, "Informe o endereço de casa."),
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

  // Conta + membership admin via RPC SECURITY DEFINER (não INSERT direto sob RLS).
  const bootstrap = await bootstrapFamilyAccount(supabase, {
    plan: "essential",
    trialEndsAt,
  });

  if (!bootstrap.accountId) {
    return {
      ok: false,
      message: `Falha ao criar conta: ${bootstrap.errorMessage ?? "sem retorno"}. Verifique se a migration 003 (bootstrap_family_account) foi aplicada.`,
    };
  }

  const accountId = bootstrap.accountId;

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

  const { data: recipient, error: recipientError } = await supabase
    .from("care_recipients")
    .insert({
      account_id: accountId,
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

  // Casa sem lat/lng: coords reais vêm do PWA do idoso (consentimento + confirmar em casa).
  const { error: homeError } = await supabase.from("safe_places").insert({
    care_recipient_id: recipient.id,
    name: LOCATION_CONSTANTS.homePlaceName,
    address_text: input.addressText,
    lat: null,
    lng: null,
    radius_m: LOCATION_CONSTANTS.defaultHomeRadiusM,
    is_home: true,
    coords_confirmed_at: null,
  });

  if (homeError) {
    return {
      ok: false,
      message: `Falha ao registrar Casa: ${homeError.message}. Verifique se a migration 004 (coords opcionais) foi aplicada.`,
    };
  }

  redirect("/familia");
}
