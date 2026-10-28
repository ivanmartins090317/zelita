import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import type { DeviceLabel, DeviceLinkChannel } from "@/modules/elder-access/domain/device-link";

export interface StoredDeviceLink {
  id: string;
  accountId: string;
  careRecipientId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
}

export interface StoredDeviceSummary {
  id: string;
  label: DeviceLabel;
  linkedAt: string;
}

function storeError(message: string): Error {
  return new Error(message);
}

export async function createFamilyDeviceClient(): Promise<SupabaseClient> {
  return createSupabaseServerClient();
}

export function createElderServiceClient(): SupabaseClient {
  return createSupabaseServiceClient();
}

export async function countDeviceLinksSince(
  supabase: SupabaseClient,
  accountId: string,
  careRecipientId: string,
  sinceIso: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("care_recipient_device_links")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .eq("care_recipient_id", careRecipientId)
    .gte("created_at", sinceIso);

  if (error) {
    throw storeError(
      "Não foi possível contar os links desta hora. Recarregue a página e tente de novo.",
    );
  }
  return count ?? 0;
}

export async function listActiveDeviceSummaries(
  supabase: SupabaseClient,
  accountId: string,
  careRecipientId: string,
): Promise<StoredDeviceSummary[]> {
  const { data, error } = await supabase
    .from("care_recipient_device_summaries")
    .select("id, label, linked_at")
    .eq("account_id", accountId)
    .eq("care_recipient_id", careRecipientId)
    .is("revoked_at", null)
    .order("linked_at", { ascending: false });

  if (error) {
    throw storeError(
      "Não foi possível ler os aparelhos. Recarregue a página.",
    );
  }

  return (data ?? []).flatMap((row) => {
    if (row.label !== "iphone" && row.label !== "android" && row.label !== "computer") {
      return [];
    }
    return [{ id: row.id, label: row.label, linkedAt: row.linked_at }];
  });
}

export async function invalidateOpenDeviceLinks(
  supabase: SupabaseClient,
  accountId: string,
  careRecipientId: string,
  usedAtIso: string,
): Promise<void> {
  const { error } = await supabase
    .from("care_recipient_device_links")
    .update({ used_at: usedAtIso })
    .eq("account_id", accountId)
    .eq("care_recipient_id", careRecipientId)
    .is("used_at", null);

  if (error) {
    throw storeError(
      "Não foi possível invalidar o link anterior. Tente de novo em instantes.",
    );
  }
}

export async function insertDeviceLink(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    careRecipientId: string;
    tokenHash: string;
    expiresAtIso: string;
    createdBy: string;
    channel: DeviceLinkChannel;
  },
): Promise<void> {
  const { error } = await supabase.from("care_recipient_device_links").insert({
    account_id: input.accountId,
    care_recipient_id: input.careRecipientId,
    token_hash: input.tokenHash,
    expires_at: input.expiresAtIso,
    created_by: input.createdBy,
    channel: input.channel,
  });

  if (error) {
    throw storeError(
      "Não foi possível criar o link. Recarregue a página e tente de novo.",
    );
  }
}

export async function revokeDeviceSummary(
  supabase: SupabaseClient,
  input: {
    accountId: string;
    careRecipientId: string;
    deviceId: string;
    revokedBy: string;
    revokedAtIso: string;
  },
): Promise<boolean> {
  const { data, error } = await supabase
    .from("care_recipient_devices")
    .update({
      revoked_at: input.revokedAtIso,
      revoked_by: input.revokedBy,
    })
    .eq("id", input.deviceId)
    .eq("account_id", input.accountId)
    .eq("care_recipient_id", input.careRecipientId)
    .is("revoked_at", null)
    .select("id");

  if (error) {
    throw storeError(
      "Não foi possível desvincular o aparelho. Tente de novo em instantes.",
    );
  }
  return (data ?? []).length > 0;
}

export async function findDeviceLinkByHash(
  tokenHash: string,
): Promise<StoredDeviceLink | null> {
  const supabase = createElderServiceClient();
  const { data, error } = await supabase
    .from("care_recipient_device_links")
    .select("id, account_id, care_recipient_id, token_hash, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw storeError(
      "Não foi possível conferir o link. Peça outro à família.",
    );
  }
  if (!data) return null;
  return {
    id: data.id,
    accountId: data.account_id,
    careRecipientId: data.care_recipient_id,
    tokenHash: data.token_hash,
    expiresAt: data.expires_at,
    usedAt: data.used_at,
  };
}

export async function careRecipientHasActiveDevice(
  careRecipientId: string,
  accountId: string,
): Promise<boolean> {
  const supabase = createElderServiceClient();
  const { count, error } = await supabase
    .from("care_recipient_devices")
    .select("id", { count: "exact", head: true })
    .eq("care_recipient_id", careRecipientId)
    .eq("account_id", accountId)
    .is("revoked_at", null);

  if (error) {
    throw storeError(
      "Não foi possível conferir se já existe aparelho. Peça outro link à família.",
    );
  }
  return (count ?? 0) > 0;
}

export async function consumeDeviceLink(linkId: string, usedAtIso: string): Promise<boolean> {
  const supabase = createElderServiceClient();
  const { data, error } = await supabase
    .from("care_recipient_device_links")
    .update({ used_at: usedAtIso })
    .eq("id", linkId)
    .is("used_at", null)
    .select("id");

  if (error) {
    throw storeError(
      "Não foi possível usar o link. Peça outro à família.",
    );
  }
  return (data ?? []).length > 0;
}

export async function insertBoundDevice(input: {
  accountId: string;
  careRecipientId: string;
  secretHash: string;
  label: DeviceLabel;
  linkedAtIso: string;
}): Promise<void> {
  const supabase = createElderServiceClient();
  const { error } = await supabase.from("care_recipient_devices").insert({
    account_id: input.accountId,
    care_recipient_id: input.careRecipientId,
    secret_hash: input.secretHash,
    label: input.label,
    linked_at: input.linkedAtIso,
    last_seen_at: input.linkedAtIso,
  });

  if (error) {
    throw storeError(
      "Não foi possível ligar este celular. Peça outro link à família.",
    );
  }
}

export interface ActiveDeviceRow {
  id: string;
  accountId: string;
  careRecipientId: string;
  secretHash: string;
}

export async function findDeviceBySecretHash(
  secretHash: string,
): Promise<ActiveDeviceRow | null> {
  const supabase = createElderServiceClient();
  const { data, error } = await supabase
    .from("care_recipient_devices")
    .select("id, account_id, care_recipient_id, secret_hash")
    .eq("secret_hash", secretHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) {
    throw storeError("Não foi possível conferir este celular. Recarregue a página.");
  }
  if (!data) return null;
  return {
    id: data.id,
    accountId: data.account_id,
    careRecipientId: data.care_recipient_id,
    secretHash: data.secret_hash,
  };
}

export async function touchDeviceLastSeen(deviceId: string, seenAtIso: string): Promise<void> {
  const supabase = createElderServiceClient();
  const { error } = await supabase
    .from("care_recipient_devices")
    .update({ last_seen_at: seenAtIso })
    .eq("id", deviceId)
    .is("revoked_at", null);

  if (error) {
    throw storeError("Não foi possível atualizar a presença do aparelho.");
  }
}
