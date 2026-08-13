import { describe, expect, it } from "vitest";

import { EXAM_CATEGORIES } from "./exam-categories";
import {
  findExamsNeedingCategory,
  formatExamNeedsTitle,
  needsExamCategory,
} from "./needs-exam-category";

describe("needs-exam-category", () => {
  it("detecta exame sem categoria", () => {
    expect(
      needsExamCategory({
        id: "1",
        title: "Hemograma",
        examDate: "2026-08-02",
        category: null,
      }),
    ).toBe(true);
    expect(
      needsExamCategory({
        id: "2",
        title: "ECG",
        examDate: "2026-07-18",
        category: EXAM_CATEGORIES.cardiology,
      }),
    ).toBe(false);
  });

  it("filtra lista pendente", () => {
    const pending = findExamsNeedingCategory([
      { id: "1", title: "A", examDate: "2026-08-02", category: null },
      { id: "2", title: "B", examDate: "2026-07-01", category: EXAM_CATEGORIES.blood },
    ]);
    expect(pending).toHaveLength(1);
  });

  it("formata título para Precisa de você", () => {
    expect(
      formatExamNeedsTitle(
        "Hemograma",
        "2026-08-02",
        "{titulo} de {data} · diga do que é",
      ),
    ).toBe("Hemograma de 02/08/2026 · diga do que é");
  });
});
