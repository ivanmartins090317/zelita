import type { ExamCategory } from "./exam-categories";

export interface ExamCategoryCheckInput {
  id: string;
  title: string;
  examDate: string;
  category: ExamCategory | null;
}

export function needsExamCategory(exam: ExamCategoryCheckInput): boolean {
  return exam.category === null;
}

export function findExamsNeedingCategory(
  exams: ExamCategoryCheckInput[],
): ExamCategoryCheckInput[] {
  return exams.filter(needsExamCategory);
}

export function formatExamNeedsTitle(
  title: string,
  examDate: string,
  template: string,
): string {
  const formattedDate = examDate.split("-").reverse().join("/");
  return template
    .replace("{titulo}", title)
    .replace("{data}", formattedDate);
}
