import type { SupabaseClient } from "@supabase/supabase-js";

export interface CareRecipientProfileUpdateInput {
  careRecipientId: string;
  fullName: string;
  displayName: string;
  birthDate: string | null;
  whatsapp: string;
  addressText: string;
}

export async function updateCareRecipientProfile(
  supabase: SupabaseClient,
  input: CareRecipientProfileUpdateInput,
): Promise<void> {
  const { error } = await supabase
    .from("care_recipients")
    .update({
      full_name: input.fullName,
      display_name: input.displayName,
      birth_date: input.birthDate,
      whatsapp: input.whatsapp,
      address_text: input.addressText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.careRecipientId);

  if (error) {
    throw new Error(
      "Não foi possível salvar os dados agora. Tente de novo em instantes.",
    );
  }
}

export function logCareRecipientUpdated(payload: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[care-recipients] care_recipient_updated", payload);
  }
}
