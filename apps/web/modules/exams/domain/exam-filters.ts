import type { ExamCategory } from "./exam-categories";

export interface ExamFilterItem {
  id: string;
  title: string;
  providerName: string | null;
  originalFileName: string;
  examDate: string;
  category: ExamCategory | null;
}

export interface FilterExamsInput {
  items: ExamFilterItem[];
  query: string;
  categoryFilter: "all" | ExamCategory;
  formatDate: (examDate: string) => string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterExams(input: FilterExamsInput): ExamFilterItem[] {
  const normalizedQuery = normalize(input.query);

  return input.items.filter((item) => {
    if (input.categoryFilter !== "all") {
      if (item.category !== input.categoryFilter) {
        return false;
      }
    }

    if (!normalizedQuery) {
      return true;
    }

    const formattedDate = input.formatDate(item.examDate);
    const haystack = [
      item.title,
      item.providerName ?? "",
      item.originalFileName,
      formattedDate,
      item.examDate,
    ]
      .map(normalize)
      .join(" ");

    return haystack.includes(normalizedQuery);
  });
}

export function sortExamsByDate<T extends { examDate: string; createdAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const dateCompare = b.examDate.localeCompare(a.examDate);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
