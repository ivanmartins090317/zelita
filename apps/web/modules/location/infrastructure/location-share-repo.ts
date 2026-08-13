import { randomBytes } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  resolveShareExpiration,
  type LocationShareDuration,
} from "../domain/location-share";

export interface LocationShareRow {
  id: string;
  careRecipientId: string;
  accountId: string;
  token: string;
  expiresAt: string;
  revokedAt: string | null;
  createdBy: string;
  createdAt: string;
}

export function generateLocationShareToken(): string {
  return randomBytes(32).toString("base64url");
}

function mapLocationShareRow(row: Record<string, unknown>): LocationShareRow {
  return {
    id: row.id as string,
    careRecipientId: row.care_recipient_id as string,
    accountId: row.account_id as string,
    token: row.token as string,
    expiresAt: row.expires_at as string,
    revokedAt: (row.revoked_at as string | null) ?? null,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
  };
}

export async function insertLocationShare(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    accountId: string;
    createdBy: string;
    duration: LocationShareDuration;
    now?: Date;
  },
): Promise<LocationShareRow> {
  const token = generateLocationShareToken();
  const expiresAt = resolveShareExpiration(input.duration, input.now ?? new Date());

  const { data, error } = await supabase
    .from("location_shares")
    .insert({
      care_recipient_id: input.careRecipientId,
      account_id: input.accountId,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: input.createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Falha ao criar link.");
  return mapLocationShareRow(data as Record<string, unknown>);
}

export async function fetchLocationShareByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<LocationShareRow | null> {
  const { data, error } = await supabase
    .from("location_shares")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLocationShareRow(data as Record<string, unknown>) : null;
}

export function buildLocationSharePublicPath(token: string): string {
  return `/l/${token}`;
}
