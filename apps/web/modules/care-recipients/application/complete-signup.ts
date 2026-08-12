"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/modules/accounts/application/family-context";
import { bootstrapFamilyAccount } from "@/modules/accounts/infrastructure/bootstrap-family-account";
import { LOCATION_CONSTANTS } from "@/modules/location";
import { onlyDigits } from "@/lib/format";
import {
  mapDndToPersistence,
  validateDndWindow,
} from "@/modules/care-recipients/domain/message-preview";
import {
  SIGNUP_CHANNEL_SLUGS,
  SIGNUP_PLAN_CHOICES,
  SIGNUP_PLANS,
  SIGNUP_RELATIONSHIP_SLUGS,
  SIGNUP_RELATIONSHIPS,
  SIGNUP_TONE_SLUGS,
  SIGNUP_TRIAL_DAYS,
  type SignupPlanChoice,
  type SignupPlanSlug,
} from "@/modules/care-recipients/domain/signup-options";
import { signupContent } from "@/content/signup";

const phoneSchema = z
  .string()
  .transform((value) => onlyDigits(value))
  .refine((digits) => digits.length >= 10, signupContent.validation.phoneInvalid);

const signupPayloadSchema = z.object({
  managerName: z.string().min(2, signupContent.validation.managerNameRequired),
  managerWhatsapp: phoneSchema,
  careFullName: z.string().min(2, signupContent.validation.careFullNameRequired),
  careDisplayName: z
    .string()
    .min(2, signupContent.validation.careDisplayNameRequired),
  careBirthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, signupContent.validation.birthDateInvalid)
    .optional()
    .or(z.literal("")),
  careRelationship: z.enum(
    SIGNUP_RELATIONSHIP_SLUGS as [string, ...string[]],
    signupContent.validation.relationshipInvalid,
  ),
  careWhatsapp: phoneSchema,
  addressText: z.string().min(5, signupContent.validation.addressRequired),
  channelPreference: z.enum(
    SIGNUP_CHANNEL_SLUGS as [string, ...string[]],
    signupContent.validation.channelInvalid,
  ),
  tone: z.enum(
    SIGNUP_TONE_SLUGS as [string, ...string[]],
    signupContent.validation.toneInvalid,
  ),
  dontBotherBefore: z.string(),
  dontBotherAfter: z.string(),
  planChoice: z.enum(
    [SIGNUP_PLAN_CHOICES.trial, SIGNUP_PLAN_CHOICES.subscribe] as [
      SignupPlanChoice,
      SignupPlanChoice,
    ],
    signupContent.validation.planInvalid,
  ),
});

export interface SignupPayload {
  managerName: string;
  managerWhatsapp: string;
  careFullName: string;
  careDisplayName: string;
  careBirthDate: string;
  careRelationship: keyof typeof SIGNUP_RELATIONSHIPS;
  careWhatsapp: string;
  addressText: string;
  channelPreference: (typeof SIGNUP_CHANNEL_SLUGS)[number];
  tone: (typeof SIGNUP_TONE_SLUGS)[number];
  dontBotherBefore: string;
  dontBotherAfter: string;
  planChoice: SignupPlanChoice;
}

export interface SignupResult {
  ok: boolean;
  message?: string;
}

function computeTrialEndsAt(planChoice: SignupPlanChoice, from: Date = new Date()): string {
  const days =
    planChoice === SIGNUP_PLAN_CHOICES.subscribe
      ? SIGNUP_TRIAL_DAYS.subscribe
      : SIGNUP_TRIAL_DAYS.trial;
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + days);
  return end.toISOString();
}

function resolvePlan(planChoice: SignupPlanChoice): SignupPlanSlug {
  return planChoice === SIGNUP_PLAN_CHOICES.subscribe
    ? SIGNUP_PLANS.cuidado_plus
    : SIGNUP_PLANS.essential;
}

export async function completeSignup(payload: SignupPayload): Promise<SignupResult> {
  const parsed = signupPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const dndValidation = validateDndWindow({
    dontBotherBefore: parsed.data.dontBotherBefore,
    dontBotherAfter: parsed.data.dontBotherAfter,
  });
  if (!dndValidation.ok) {
    return { ok: false, message: dndValidation.message };
  }

  const { supabase, user } = await requireUser();
  const input = parsed.data;
  const dnd = mapDndToPersistence({
    dontBotherBefore: input.dontBotherBefore,
    dontBotherAfter: input.dontBotherAfter,
  });

  const { data: existingMember } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existingMember?.account_id) {
    const { data: existingRecipient } = await supabase
      .from("care_recipients")
      .select("id")
      .eq("account_id", existingMember.account_id)
      .limit(1)
      .maybeSingle();

    if (existingRecipient?.id) {
      redirect("/familia");
    }
  }

  const plan = resolvePlan(input.planChoice);
  const trialEndsAt = computeTrialEndsAt(input.planChoice);

  const bootstrap = await bootstrapFamilyAccount(supabase, {
    plan,
    trialEndsAt,
  });

  if (!bootstrap.accountId) {
    return { ok: false, message: signupContent.messages.persistFailure };
  }

  const accountId = bootstrap.accountId;
  const relationshipLabel =
    SIGNUP_RELATIONSHIPS[input.careRelationship as keyof typeof SIGNUP_RELATIONSHIPS];

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: input.managerName,
    phone_whatsapp: input.managerWhatsapp,
  });

  if (profileError) {
    return { ok: false, message: signupContent.messages.persistFailure };
  }

  const { data: recipient, error: recipientError } = await supabase
    .from("care_recipients")
    .insert({
      account_id: accountId,
      full_name: input.careFullName,
      display_name: input.careDisplayName,
      birth_date: input.careBirthDate || null,
      relationship: relationshipLabel,
      whatsapp: input.careWhatsapp,
      address_text: input.addressText,
      dnd_start: dnd.dndStart,
      dnd_end: dnd.dndEnd,
      channel_preference: input.channelPreference,
      tone: input.tone,
    })
    .select("id")
    .single();

  if (recipientError || !recipient) {
    return { ok: false, message: signupContent.messages.persistFailure };
  }

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
    return { ok: false, message: signupContent.messages.persistFailure };
  }

  redirect("/familia");
}
