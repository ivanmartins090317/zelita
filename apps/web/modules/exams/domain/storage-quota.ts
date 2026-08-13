export const EXAM_MAX_FILE_BYTES = 25 * 1024 * 1024;

export const STORAGE_QUOTA_BYTES = {
  essential: 2 * 1024 * 1024 * 1024,
  cuidado_plus: 20 * 1024 * 1024 * 1024,
} as const;

export type AccountPlanSlug = keyof typeof STORAGE_QUOTA_BYTES | "trial";

export function resolveStorageQuotaBytes(plan: string | null | undefined): number {
  if (plan === "essential") {
    return STORAGE_QUOTA_BYTES.essential;
  }
  return STORAGE_QUOTA_BYTES.cuidado_plus;
}

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

export function formatBytesReadable(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export const ALLOWED_EXAM_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isAllowedExamMime(mime: string): boolean {
  return (ALLOWED_EXAM_MIME_TYPES as readonly string[]).includes(mime);
}
