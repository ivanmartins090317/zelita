import { randomBytes } from "crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

export interface ExamShareLinkRow {
  id: string;
  examId: string;
  token: string;
  expiresAt: string;
  createdBy: string | null;
  createdAt: string;
}

export type ShareLinkDuration = "1h" | "4h" | "today";

export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export function resolveShareExpiration(
  duration: ShareLinkDuration,
  now = new Date(),
): Date {
  if (duration === "1h") {
    return new Date(now.getTime() + 60 * 60 * 1000);
  }
  if (duration === "4h") {
    return new Date(now.getTime() + 4 * 60 * 60 * 1000);
  }

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

function mapShareRow(row: Record<string, unknown>): ExamShareLinkRow {
  return {
    id: row.id as string,
    examId: row.exam_id as string,
    token: row.token as string,
    expiresAt: row.expires_at as string,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function insertExamShareLink(
  supabase: SupabaseClient,
  input: {
    examId: string;
    duration: ShareLinkDuration;
    createdBy: string;
    now?: Date;
  },
): Promise<ExamShareLinkRow> {
  const token = generateShareToken();
  const expiresAt = resolveShareExpiration(input.duration, input.now ?? new Date());

  const { data, error } = await supabase
    .from("exam_share_links")
    .insert({
      exam_id: input.examId,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: input.createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Falha ao gerar link.");
  return mapShareRow(data);
}

export async function fetchShareLinkByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<ExamShareLinkRow | null> {
  const { data, error } = await supabase
    .from("exam_share_links")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw error;
  return data ? mapShareRow(data) : null;
}

export function isShareLinkValid(
  link: ExamShareLinkRow,
  now = new Date(),
): boolean {
  return new Date(link.expiresAt).getTime() > now.getTime();
}

export function buildSharePublicPath(token: string): string {
  return `/l/${token}`;
}
