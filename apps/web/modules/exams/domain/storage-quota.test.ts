import { describe, expect, it } from "vitest";

import {
  EXAM_MAX_FILE_BYTES,
  formatBytesReadable,
  isAllowedExamMime,
  resolveStorageQuotaBytes,
  STORAGE_QUOTA_BYTES,
  sumExamStorageBytes,
  wouldExceedQuota,
} from "./storage-quota";

describe("storage-quota", () => {
  it("resolve cota por plano", () => {
    expect(resolveStorageQuotaBytes("essential")).toBe(STORAGE_QUOTA_BYTES.essential);
    expect(resolveStorageQuotaBytes("cuidado_plus")).toBe(
      STORAGE_QUOTA_BYTES.cuidado_plus,
    );
    expect(resolveStorageQuotaBytes("trial")).toBe(STORAGE_QUOTA_BYTES.cuidado_plus);
  });

  it("detecta estouro de cota", () => {
    const limit = STORAGE_QUOTA_BYTES.essential;
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
