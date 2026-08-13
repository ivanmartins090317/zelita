import { describe, expect, it } from "vitest";

import { EXAM_CATEGORIES } from "./exam-categories";
import { filterExams, sortExamsByDate } from "./exam-filters";

const items = [
  {
    id: "1",
    title: "Hemograma completo",
    providerName: "Laboratório Delta",
    originalFileName: "hemograma-02-08.pdf",
    examDate: "2026-08-02",
    category: null,
    createdAt: "2026-08-02T18:00:00.000Z",
  },
  {
    id: "2",
    title: "Glicemia em jejum",
    providerName: "Laboratório Delta",
    originalFileName: "glicemia.pdf",
    examDate: "2026-05-28",
    category: EXAM_CATEGORIES.blood,
    createdAt: "2026-05-28T10:00:00.000Z",
  },
];

describe("filterExams", () => {
  it("filtra por texto em título", () => {
    const result = filterExams({
      items,
      query: "hemograma",
      categoryFilter: "all",
      formatDate: (d) => d.split("-").reverse().join("/"),
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("1");
  });

  it("filtra por categoria", () => {
    const result = filterExams({
      items,
      query: "",
      categoryFilter: EXAM_CATEGORIES.blood,
      formatDate: (d) => d,
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("2");
  });

  it("sem categoria só aparece em Todos", () => {
    const result = filterExams({
      items,
      query: "",
      categoryFilter: EXAM_CATEGORIES.blood,
      formatDate: (d) => d,
    });
    expect(result.some((item) => item.id === "1")).toBe(false);
  });
});

describe("sortExamsByDate", () => {
  it("ordena por data desc e createdAt desc", () => {
    const sorted = sortExamsByDate(items);
    expect(sorted[0]?.id).toBe("1");
    expect(sorted[1]?.id).toBe("2");
  });
});
