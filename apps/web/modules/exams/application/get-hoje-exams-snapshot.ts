import { familyContent, familyRoutes } from "@/content/family";
import type { NeedsPriorityItem } from "@/modules/agenda/domain/needs-priority";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  findExamsNeedingCategory,
  formatExamNeedsTitle,
} from "../domain/needs-exam-category";
import { fetchExamsForCareRecipient } from "../infrastructure/exam-repo";

export interface HojeExamsSnapshot {
  examCount: number;
  needsItems: NeedsPriorityItem[];
}

const EXAM_NEEDS_SORT_KEY = 4;

export async function getHojeExamsSnapshot(input: {
  careRecipientId: string;
  maxNeeds?: number;
}): Promise<HojeExamsSnapshot> {
  const copy = familyContent.exames.hoje;
  const supabase = await createSupabaseServerClient();
  const exams = await fetchExamsForCareRecipient(supabase, input.careRecipientId);

  const needsExams = findExamsNeedingCategory(exams).slice(0, input.maxNeeds ?? 1);
  const needsItems: NeedsPriorityItem[] = needsExams.map((exam) => ({
    id: `exam-uncat-${exam.id}`,
    kind: "task_assigned",
    sortKey: EXAM_NEEDS_SORT_KEY,
    title: copy.needsTitle,
    subtitle: formatExamNeedsTitle(
      exam.title,
      exam.examDate,
      copy.needsSubtitleTemplate,
    ),
    icon: "📄",
    href: `${familyRoutes.exames}?exame=${exam.id}`,
  }));

  return {
    examCount: exams.length,
    needsItems,
  };
}
