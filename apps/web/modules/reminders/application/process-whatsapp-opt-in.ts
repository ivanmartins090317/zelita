import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isOptInAffirmation,
  phonesMatch,
} from "@/modules/reminders/domain/opt-in-reply";

export interface ProcessOptInInput {
  text: string | null | undefined;
  from: string | null | undefined;
}

export interface ProcessOptInResult {
  accepted: boolean;
  careRecipientId?: string;
  reason?: string;
}

export async function processWhatsAppOptIn(
  supabase: SupabaseClient,
  input: ProcessOptInInput,
): Promise<ProcessOptInResult> {
  if (!isOptInAffirmation(input.text)) {
    return { accepted: false, reason: "not_affirmation" };
  }
  if (!input.from) {
    return { accepted: false, reason: "missing_from" };
  }

  const { data: recipients, error } = await supabase
    .from("care_recipients")
    .select("id, whatsapp")
    .is("wa_opt_in_at", null);

  if (error) {
    throw new Error(
      `Falha ao buscar pessoas cuidadas para opt-in: ${error.message}. Tente de novo.`,
    );
  }

  const match = recipients?.find((recipient) =>
    phonesMatch(recipient.whatsapp, input.from),
  );

  if (!match) {
    return { accepted: false, reason: "no_recipient_match" };
  }

  const { error: updateError } = await supabase
    .from("care_recipients")
    .update({ wa_opt_in_at: new Date().toISOString() })
    .eq("id", match.id);

  if (updateError) {
    throw new Error(
      `Falha ao gravar opt-in: ${updateError.message}. Confira o service role.`,
    );
  }

  const { error: eventError } = await supabase.from("medication_events").insert({
    care_recipient_id: match.id,
    type: "wa_opt_in_accepted",
    channel: "whatsapp",
    payload: { matched: true },
  });

  if (eventError) {
    throw new Error(
      `Opt-in gravado, mas o evento de auditoria falhou: ${eventError.message}.`,
    );
  }

  return { accepted: true, careRecipientId: match.id };
}
