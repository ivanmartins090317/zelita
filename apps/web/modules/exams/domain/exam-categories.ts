export const EXAM_CATEGORIES = {
  blood: "blood",
  image: "image",
  cardiology: "cardiology",
  prescriptions: "prescriptions",
  other: "other",
} as const;

export type ExamCategory = (typeof EXAM_CATEGORIES)[keyof typeof EXAM_CATEGORIES];

export const EXAM_CATEGORY_FILTER_CHIPS = [
  { slug: "all" as const, labelKey: "all" as const },
  { slug: EXAM_CATEGORIES.blood, labelKey: "blood" as const },
  { slug: EXAM_CATEGORIES.image, labelKey: "image" as const },
  { slug: EXAM_CATEGORIES.cardiology, labelKey: "cardiology" as const },
  { slug: EXAM_CATEGORIES.prescriptions, labelKey: "prescriptions" as const },
] as const;

export type ExamCategoryFilterSlug =
  | "all"
  | ExamCategory;

export function isExamCategory(value: string | null | undefined): value is ExamCategory {
  if (!value) return false;
  return Object.values(EXAM_CATEGORIES).includes(value as ExamCategory);
}

export function getCategoryTagTone(
  category: ExamCategory | null,
): "warning" | "ok" {
  if (!category) return "warning";
  return "ok";
}
