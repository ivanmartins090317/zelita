import { describe, expect, it } from "vitest";

import { getPlanDefinition, PLAN_SLUGS } from "@/modules/billing/domain/plans";

import {
  EXAM_MAX_FILE_BYTES,
  formatBytesReadable,
  isAllowedExamMime,
  resolveStorageQuotaBytes,
  sumExamStorageBytes,
  wouldExceedQuota,
} from "./storage-quota";

describe("storage-quota", () => {
  it("resolve cota via billing por plano efetivo", () => {
    expect(resolveStorageQuotaBytes("essential")).toBe(
      getPlanDefinition(PLAN_SLUGS.essential).storageQuotaBytes,
    );
    expect(resolveStorageQuotaBytes("cuidado_plus")).toBe(
      getPlanDefinition(PLAN_SLUGS.cuidado_plus).storageQuotaBytes,
    );
    expect(resolveStorageQuotaBytes("typo")).toBe(
      getPlanDefinition(PLAN_SLUGS.essential).storageQuotaBytes,
    );
  });

  it("detecta estouro de cota", () => {
    const limit = resolveStorageQuotaBytes("essential");
    expect(wouldExceedQuota(limit - 1000, 500, "essential")).toBe(false);
    expect(wouldExceedQuota(limit - 100, 200, "essential")).toBe(true);
  });

  it("soma bytes dos exames", () => {
    expect(sumExamStorageBytes([1000, 2000])).toBe(3000);
  });

  it("formata tamanho legível", () => {
    expect(formatBytesReadable(1258291)).toContain("MB");
  });

  it("valida MIME permitido", () => {
    expect(isAllowedExamMime("application/pdf")).toBe(true);
    expect(isAllowedExamMime("application/x-msdownload")).toBe(false);
    expect(EXAM_MAX_FILE_BYTES).toBe(26214400);
  });
});
