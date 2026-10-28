import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { canInviteOrChangeRoles } from "@/modules/accounts/domain/roles";
import { fetchCareRecipientSettings } from "@/modules/care-recipients/infrastructure/care-recipient-settings-repo";

export interface CareChannelForDeviceLink {
  whatsapp: string | null;
  optedIn: boolean;
  displayName: string;
}

/** Leitura do canal para o link remoto. O id vem da sessão da administradora. */
export async function readCareChannelForDeviceLink(): Promise<CareChannelForDeviceLink | null> {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) return null;
  if (!canInviteOrChangeRoles(ctx.role)) return null;

  const supabase = await createSupabaseServerClient();
  const recipient = await fetchCareRecipientSettings(supabase, ctx.careRecipientId);
  if (!recipient || recipient.id !== ctx.careRecipientId) return null;

  return {
    whatsapp: recipient.whatsapp,
    optedIn: Boolean(recipient.wa_opt_in_at),
    displayName: recipient.display_name?.trim() || recipient.full_name?.trim() || "",
  };
}
