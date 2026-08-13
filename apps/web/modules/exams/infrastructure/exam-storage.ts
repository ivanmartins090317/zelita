import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

import {
  EXAM_MAX_FILE_BYTES,
  isAllowedExamMime,
} from "../domain/storage-quota";

const EXAMS_BUCKET = "exams";
const SIGNED_URL_TTL_SECONDS = 300;

export function buildExamStoragePath(
  accountId: string,
  careRecipientId: string,
  extension: string,
): string {
  const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  return `${accountId}/${careRecipientId}/${randomUUID()}.${safeExt}`;
}

export function resolveExtensionFromMime(mime: string): string {
  switch (mime) {
    case "application/pdf":
      return "pdf";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export function sanitizeOriginalFileName(name: string): string {
  return name.replace(/[^\w.\-() áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g, "_").slice(0, 200);
}

export interface UploadExamBlobInput {
  supabase: SupabaseClient;
  accountId: string;
  careRecipientId: string;
  fileBytes: Buffer;
  mimeType: string;
  originalFileName: string;
}

export interface UploadExamBlobResult {
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

export function validateExamUpload(mimeType: string, sizeBytes: number): string | null {
  if (!isAllowedExamMime(mimeType)) {
    return "Use PDF ou foto (JPG, PNG, WebP).";
  }
  if (sizeBytes <= 0 || sizeBytes > EXAM_MAX_FILE_BYTES) {
    return "O arquivo deve ter no máximo 25 MB.";
  }
  return null;
}

export async function uploadExamBlob(
  input: UploadExamBlobInput,
): Promise<UploadExamBlobResult> {
  const validationError = validateExamUpload(input.mimeType, input.fileBytes.length);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = resolveExtensionFromMime(input.mimeType);
  const storagePath = buildExamStoragePath(
    input.accountId,
    input.careRecipientId,
    extension,
  );

  const { error } = await input.supabase.storage
    .from(EXAMS_BUCKET)
    .upload(storagePath, input.fileBytes, {
      contentType: input.mimeType,
      upsert: false,
    });

  if (error) throw error;

  return {
    storagePath,
    originalFileName: sanitizeOriginalFileName(input.originalFileName),
    mimeType: input.mimeType,
    sizeBytes: input.fileBytes.length,
  };
}

export async function deleteExamBlob(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<void> {
  const { error } = await supabase.storage.from(EXAMS_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function createSignedExamUrl(
  supabase: SupabaseClient,
  storagePath: string,
  ttlSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(EXAMS_BUCKET)
    .createSignedUrl(storagePath, ttlSeconds);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("Não foi possível gerar link de acesso.");
  }

  return data.signedUrl;
}

export { EXAMS_BUCKET, SIGNED_URL_TTL_SECONDS };
