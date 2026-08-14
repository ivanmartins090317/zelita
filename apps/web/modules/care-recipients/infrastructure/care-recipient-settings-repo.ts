import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  SignupChannelSlug,
  SignupToneSlug,
} from "@/modules/care-recipients/domain/signup-options";

export interface CareRecipientSettingsRow {
  id: string;
  full_name: string;
  display_name: string;
  birth_date: string | null;
  whatsapp: string | null;
  address_text: string | null;
  tone: SignupToneSlug;
  channel_preference: SignupChannelSlug;
  dnd_start: string | null;
  dnd_end: string | null;
  wa_opt_in_at: string | null;
  geo_consent_at: string | null;
  geo_consent_revoked_at: string | null;
}

export async function fetchCareRecipientSettings(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<CareRecipientSettingsRow | null> {
  const { data, error } = await supabase
    .from("care_recipients")
    .select(
      "id, full_name, display_name, birth_date, whatsapp, address_text, tone, channel_preference, dnd_start, dnd_end, wa_opt_in_at, geo_consent_at, geo_consent_revoked_at",
    )
    .eq("id", careRecipientId)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Não foi possível carregar as configurações agora. Tente recarregar a página.",
    );
  }

  return (data as CareRecipientSettingsRow | null) ?? null;
}

export async function updateCareRecipientSettings(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    tone: SignupToneSlug;
    channelPreference: SignupChannelSlug;
    dndStart: string;
    dndEnd: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("care_recipients")
    .update({
      tone: input.tone,
      channel_preference: input.channelPreference,
      dnd_start: input.dndStart,
      dnd_end: input.dndEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.careRecipientId);

  if (error) {
    throw new Error(
      "Não foi possível salvar tom e horários agora. Tente de novo em instantes.",
    );
  }
}

export function logCareSettingsUpdated(payload: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[care-recipients] care_settings_updated", payload);
  }
}
