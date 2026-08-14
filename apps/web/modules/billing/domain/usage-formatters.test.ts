import { describe, expect, it } from "vitest";

import {
  formatBytesReadable,
  formatMembersUsageLine,
  formatStorageLimitBytes,
  formatStorageUsageLine,
  formatVoiceUsageLine,
  formatWhatsAppUsageLine,
  getMonthBounds,
  isStorageQuotaExceeded,
} from "./usage-formatters";

describe("usage-formatters", () => {
  it("calcula limites do mês em São Paulo", () => {
    const bounds = getMonthBounds(new Date("2026-08-14T15:00:00.000Z"));
    expect(bounds.startIso).toBe("2026-08-01T00:00:00.000-03:00");
    expect(bounds.endIso).toBe("2026-08-31T23:59:59.999-03:00");
  });

  it("formata bytes legíveis pt-BR", () => {
    expect(formatBytesReadable(12_582_912)).toBe("12,0 MB");
    expect(formatStorageLimitBytes(20 * 1024 * 1024 * 1024)).toBe("20 GB");
    expect(formatStorageUsageLine(12_287_180, 20 * 1024 * 1024 * 1024)).toBe(
      "11,7 MB de 20 GB",
    );
  });

  it("formata linhas de uso", () => {
    expect(formatWhatsAppUsageLine(184, "ilimitado no plano")).toBe(
      "184 enviadas · ilimitado no plano",
    );
    expect(formatWhatsAppUsageLine(0, "ilimitado no plano")).toBe(
      "0 enviadas · ilimitado no plano",
    );
    expect(
      formatVoiceUsageLine(6, "{count} realizadas este mês"),
    ).toBe("6 realizadas este mês");
    expect(
      formatMembersUsageLine({
        count: 5,
        maxMembers: null,
        unlimitedSuffix: "ilimitado no plano",
        limitedTemplate: "{limit} incluídas",
      }),
    ).toBe("5 · ilimitado no plano");
    expect(
      formatMembersUsageLine({
        count: 4,
        maxMembers: 3,
        unlimitedSuffix: "ilimitado no plano",
        limitedTemplate: "{limit} incluídas",
      }),
    ).toBe("4 de 3 incluídas");
  });

  it("detecta cota esgotada", () => {
    const limit = 2 * 1024 * 1024 * 1024;
    expect(isStorageQuotaExceeded(limit, limit)).toBe(true);
    expect(isStorageQuotaExceeded(limit - 1, limit)).toBe(false);
  });
});
