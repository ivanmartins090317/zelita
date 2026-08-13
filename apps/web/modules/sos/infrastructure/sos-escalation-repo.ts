import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountRole } from "@/modules/accounts/domain/roles";

export interface SosEscalationEntryRow {
  id: string;
  configId: string;
  position: number;
  memberId: string | null;
  profileId: string | null;
  role: AccountRole;
  displayName: string;
  relationshipLabel: string | null;
}

export interface SosEscalationConfigRow {
  id: string;
  accountId: string;
  careRecipientId: string;
  entries: SosEscalationEntryRow[];
}

function mapEntryRow(row: Record<string, unknown>): SosEscalationEntryRow {
  return {
    id: row.id as string,
    configId: row.config_id as string,
    position: row.position as number,
    memberId: (row.member_id as string | null) ?? null,
    profileId: (row.profile_id as string | null) ?? null,
    role: row.role as AccountRole,
    displayName: row.display_name as string,
    relationshipLabel: (row.relationship_label as string | null) ?? null,
  };
}

export async function fetchSosEscalationConfig(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<SosEscalationConfigRow | null> {
  const { data: config, error: configError } = await supabase
    .from("sos_escalation_config")
    .select("id, account_id, care_recipient_id")
    .eq("care_recipient_id", careRecipientId)
    .maybeSingle();

  if (configError) {
    throw new Error(configError.message);
  }

  if (!config) return null;

  const { data: entries, error: entriesError } = await supabase
    .from("sos_escalation_entries")
    .select(
      "id, config_id, position, member_id, profile_id, role, display_name, relationship_label",
    )
    .eq("config_id", config.id)
    .order("position", { ascending: true });

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  return {
    id: config.id as string,
    accountId: config.account_id as string,
    careRecipientId: config.care_recipient_id as string,
    entries: (entries ?? []).map((row) =>
      mapEntryRow(row as Record<string, unknown>),
    ),
  };
}

export async function countSosEscalationContacts(
  supabase: SupabaseClient,
  careRecipientId: string,
): Promise<number> {
  const config = await fetchSosEscalationConfig(supabase, careRecipientId);
  return config?.entries.length ?? 0;
}

export async function isProfileInSosEscalation(
  supabase: SupabaseClient,
  accountId: string,
  profileId: string,
): Promise<boolean> {
  const { data: configs, error: configError } = await supabase
    .from("sos_escalation_config")
    .select("id")
    .eq("account_id", accountId)
    .limit(1);

  if (configError) {
    throw new Error(configError.message);
  }

  const configId = configs?.[0]?.id as string | undefined;
  if (!configId) return false;

  const { count, error } = await supabase
    .from("sos_escalation_entries")
    .select("*", { count: "exact", head: true })
    .eq("config_id", configId)
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

export interface SaveEscalationEntryInput {
  memberId: string;
  profileId: string | null;
  role: AccountRole;
  displayName: string;
  relationshipLabel: string | null;
  position: number;
}

export async function saveSosEscalationOrder(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    careRecipientId: string;
    entries: SaveEscalationEntryInput[];
  },
): Promise<SosEscalationConfigRow> {
  const existing = await fetchSosEscalationConfig(
    supabase,
    input.careRecipientId,
  );

  let configId = existing?.id;

  if (!configId) {
    const { data: created, error: createError } = await supabase
      .from("sos_escalation_config")
      .insert({
        account_id: input.accountId,
        care_recipient_id: input.careRecipientId,
      })
      .select("id")
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    configId = created.id as string;
  } else {
    const { error: deleteError } = await supabase
      .from("sos_escalation_entries")
      .delete()
      .eq("config_id", configId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: touchError } = await supabase
      .from("sos_escalation_config")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", configId);

    if (touchError) {
      throw new Error(touchError.message);
    }
  }

  if (input.entries.length > 0) {
    const { error: insertError } = await supabase
      .from("sos_escalation_entries")
      .insert(
        input.entries.map((entry) => ({
          config_id: configId,
          position: entry.position,
          member_id: entry.memberId,
          profile_id: entry.profileId,
          role: entry.role,
          display_name: entry.displayName,
          relationship_label: entry.relationshipLabel,
        })),
      );

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  const saved = await fetchSosEscalationConfig(
    supabase,
    input.careRecipientId,
  );

  if (!saved) {
    throw new Error("Não foi possível salvar a ordem de aviso.");
  }

  return saved;
}
