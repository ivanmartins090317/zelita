import {
  formatBytesReadable,
  resolveStorageQuotaBytes,
} from "@/modules/billing";

export const EXAM_MAX_FILE_BYTES = 25 * 1024 * 1024;

export { formatBytesReadable, resolveStorageQuotaBytes };

export const ALLOWED_EXAM_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function sumExamStorageBytes(sizes: number[]): number {
  return sizes.reduce((total, size) => total + size, 0);
}

export function wouldExceedQuota(
  currentUsageBytes: number,
  incomingBytes: number,
  plan: string | null | undefined,
): boolean {
  const limit = resolveStorageQuotaBytes(plan);
  return currentUsageBytes + incomingBytes > limit;
}

export function isAllowedExamMime(mime: string): boolean {
  return (ALLOWED_EXAM_MIME_TYPES as readonly string[]).includes(mime);
}
