import { describe, expect, it } from "vitest";

import {
  EXAM_CATEGORIES,
  getCategoryTagTone,
  isExamCategory,
} from "./exam-categories";

describe("exam-categories", () => {
  it("valida categorias conhecidas", () => {
    expect(isExamCategory("blood")).toBe(true);
    expect(isExamCategory("invalid")).toBe(false);
    expect(isExamCategory(null)).toBe(false);
  });

  it("sem categoria usa tom warning", () => {
    expect(getCategoryTagTone(null)).toBe("warning");
    expect(getCategoryTagTone(EXAM_CATEGORIES.blood)).toBe("ok");
  });
});
