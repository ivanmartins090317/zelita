import { getZonedParts } from "@/modules/medications/domain/hoje-timeline";

export const BILLING_TIME_ZONE = "America/Sao_Paulo";

export function getMonthBounds(
  now: Date,
  timeZone: string = BILLING_TIME_ZONE,
): { startIso: string; endIso: string } {
  const { year, month } = getZonedParts(now, timeZone);
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startIso: `${monthKey}-01T00:00:00.000-03:00`,
    endIso: `${monthKey}-${String(lastDay).padStart(2, "0")}T23:59:59.999-03:00`,
  };
}

export function formatBytesReadable(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }
  const gb = bytes / (1024 * 1024 * 1024);
  if (Number.isInteger(gb)) return `${gb} GB`;
  return `${gb.toFixed(1).replace(".", ",")} GB`;
}

export function formatStorageLimitBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    const gb = bytes / (1024 * 1024 * 1024);
    if (Number.isInteger(gb)) return `${gb} GB`;
    return `${gb.toFixed(1).replace(".", ",")} GB`;
  }
  return formatBytesReadable(bytes);
}

export function formatStorageUsageLine(
  usedBytes: number,
  limitBytes: number,
): string {
  return `${formatBytesReadable(usedBytes)} de ${formatStorageLimitBytes(limitBytes)}`;
}

export function isStorageQuotaExceeded(
  usedBytes: number,
  limitBytes: number,
): boolean {
  return usedBytes >= limitBytes;
}

export function formatWhatsAppUsageLine(
  count: number,
  unlimitedSuffix: string,
): string {
  return `${count} enviadas · ${unlimitedSuffix}`;
}

export function formatVoiceUsageLine(
  count: number,
  monthTemplate: string,
): string {
  return monthTemplate.replace("{count}", String(count));
}

export function formatMembersUsageLine(input: {
  count: number;
  maxMembers: number | null;
  unlimitedSuffix: string;
  limitedTemplate: string;
}): string {
  if (input.maxMembers == null) {
    return `${input.count} · ${input.unlimitedSuffix}`;
  }
  return `${input.count} de ${input.limitedTemplate.replace("{limit}", String(input.maxMembers))}`;
}
