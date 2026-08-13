import { familyContent, familyRoutes } from "@/content/family";
import {
  getFamilyContext,
  requireRoutineViewer,
} from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import {
  ACCOUNT_ROLES,
  canViewCareRoutine,
  isAccountPaused,
} from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canManageExams } from "./can-manage-exams";
import { getCategoryTagTone, isExamCategory } from "../domain/exam-categories";
import { formatBytesReadable } from "../domain/storage-quota";
import { buildVisibilityLabel } from "../domain/visibility-labels";
import {
  fetchExamById,
  fetchExamMemberAccess,
  fetchExamsForCareRecipient,
  fetchTotalExamBytes,
} from "../infrastructure/exam-repo";
import { createSignedExamUrl } from "../infrastructure/exam-storage";

export interface ExamMemberOption {
  profileId: string;
  displayName: string;
  role: string;
  isAdmin: boolean;
  isCurrentUser: boolean;
}

export interface ExamListItem {
  id: string;
  title: string;
  fileLine: string;
  examDate: string;
  examDateLabel: string;
  providerName: string | null;
  category: import("../domain/exam-categories").ExamCategory | null;
  categoryLabel: string;
  categoryTone: "warning" | "ok";
  visibilityLabel: string;
}

export interface ExamDetailViewModel {
  id: string;
  headerTitle: string;
  title: string;
  examDate: string;
  examDateLabel: string;
  providerName: string | null;
  category: import("../domain/exam-categories").ExamCategory | null;
  categoryLabel: string;
  categoryTone: "warning" | "ok";
  notes: string | null;
  addedByLine: string;
  previewUrl: string | null;
  isPdf: boolean;
  isImage: boolean;
  mimeType: string;
  memberProfileIds: string[];
}

export interface ExamesPageViewModel {
  exams: ExamListItem[];
  selectedExamId: string | null;
  selectedDetail: ExamDetailViewModel | null;
  members: ExamMemberOption[];
  canManage: boolean;
  isPaused: boolean;
  careRecipientId: string;
  openModal: boolean;
  editingExam: ExamDetailViewModel | null;
  hasHiddenExams: boolean;
  totalExamCount: number;
  storageUsageBytes: number;
  accountPlan: string;
}

export type ExamesPageResult =
  | { ok: true; data: ExamesPageViewModel }
  | { ok: false; message: string };

function formatExamDate(examDate: string): string {
  return examDate.split("-").reverse().join("/");
}

function formatAddedByLine(
  creatorName: string | null,
  createdAt: string,
  template: string,
): string {
  const date = new Date(createdAt);
  const datePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return template
    .replace("{nome}", creatorName ?? "Alguém")
    .replace("{data}", datePart)
    .replace("{hora}", timePart);
}

function resolveCategoryLabel(
  category: string | null,
  copy: typeof familyContent.exames,
): { label: string; tone: "warning" | "ok" } {
  if (!category) {
    return { label: copy.categories.uncategorized, tone: "warning" };
  }
  const key = category as keyof typeof copy.categories;
  return {
    label: copy.categories[key] ?? copy.categories.other,
    tone: getCategoryTagTone(isExamCategory(category) ? category : null),
  };
}

async function buildDetailViewModel(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  exam: NonNullable<Awaited<ReturnType<typeof fetchExamById>>>,
  memberAccess: string[],
  creatorNames: Map<string, string>,
  copy: typeof familyContent.exames,
): Promise<ExamDetailViewModel | null> {
  if (!exam) return null;

  const category = resolveCategoryLabel(exam.category, copy);
  let previewUrl: string | null = null;
  try {
    previewUrl = await createSignedExamUrl(supabase, exam.storagePath);
  } catch {
    previewUrl = null;
  }

  return {
    id: exam.id,
    headerTitle: `${exam.title} · ${formatExamDate(exam.examDate)}`,
    title: exam.title,
    examDate: exam.examDate,
    examDateLabel: formatExamDate(exam.examDate),
    providerName: exam.providerName,
    category: exam.category,
    categoryLabel: category.label,
    categoryTone: category.tone,
    notes: exam.notes,
    addedByLine: formatAddedByLine(
      exam.createdBy ? creatorNames.get(exam.createdBy) ?? null : null,
      exam.createdAt,
      copy.detail.addedByTemplate,
    ),
    previewUrl,
    isPdf: exam.mimeType === "application/pdf",
    isImage: exam.mimeType.startsWith("image/"),
    mimeType: exam.mimeType,
    memberProfileIds: memberAccess,
  };
}

export async function getExamesPage(input: {
  modal?: string | null;
  exame?: string | null;
  editar?: string | null;
}): Promise<ExamesPageResult> {
  try {
    await requireRoutineViewer();
    const shell = await getShellContext();
    if (!shell) {
      return { ok: false, message: familyContent.exames.loadError };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, message: familyContent.exames.loadError };
    }

    const copy = familyContent.exames;
    const supabase = await createSupabaseServerClient();
    const canManage = canManageExams(ctx.role);
    const isPaused = isAccountPaused(ctx.accountStatus ?? "active");

    const [examRows, memberRows, totalBytes] = await Promise.all([
      fetchExamsForCareRecipient(supabase, ctx.careRecipientId),
      supabase
        .from("account_members")
        .select("profile_id, role, profiles(full_name)")
        .eq("account_id", ctx.accountId)
        .eq("status", "active"),
      fetchTotalExamBytes(supabase, ctx.careRecipientId),
    ]);

    const memberOptions: ExamMemberOption[] = [];
    const creatorNames = new Map<string, string>();

    for (const row of memberRows.data ?? []) {
      const profileId = row.profile_id as string;
      const role = row.role as string;
      if (!canViewCareRoutine(role as typeof ctx.role)) continue;

      const profile = Array.isArray(row.profiles)
        ? row.profiles[0]
        : row.profiles;
      const displayName =
        (profile as { full_name?: string })?.full_name ?? "Participante";
      creatorNames.set(profileId, displayName);
      memberOptions.push({
        profileId,
        displayName,
        role,
        isAdmin: role === ACCOUNT_ROLES.admin,
        isCurrentUser: profileId === ctx.userId,
      });
    }

    const examIds = examRows.map((exam) => exam.id);
    const accessRows = await fetchExamMemberAccess(supabase, examIds);
    const accessByExam = new Map<string, string[]>();
    for (const row of accessRows) {
      const current = accessByExam.get(row.examId) ?? [];
      current.push(row.profileId);
      accessByExam.set(row.examId, current);
    }

    const exams: ExamListItem[] = examRows.map((exam) => {
      const memberIds = accessByExam.get(exam.id) ?? [];
      const membersWithAccess = memberIds
        .map((profileId) => memberOptions.find((m) => m.profileId === profileId))
        .filter(Boolean)
        .map((member) => ({
          profileId: member!.profileId,
          displayName: member!.displayName,
          isAdmin: member!.isAdmin,
        }));

      const category = resolveCategoryLabel(exam.category, copy);

      return {
        id: exam.id,
        title: exam.title,
        fileLine: `${exam.originalFileName} · ${formatBytesReadable(exam.sizeBytes)}`,
        examDate: exam.examDate,
        examDateLabel: formatExamDate(exam.examDate),
        providerName: exam.providerName,
        category: exam.category,
        categoryLabel: category.label,
        categoryTone: category.tone,
        visibilityLabel: buildVisibilityLabel({
          membersWithAccess,
          familyLabel: copy.visibility.family,
          familyPlusTemplate: copy.visibility.familyPlus,
        }),
      };
    });

    let totalExamCount = examRows.length;
    let hasHiddenExams = false;

    if (!canManage && canViewCareRoutine(ctx.role)) {
      const { data: totalCountData } = await supabase.rpc(
        "total_exam_count_for_recipient",
        { p_care_recipient_id: ctx.careRecipientId },
      );
      totalExamCount = Number(totalCountData ?? examRows.length);
      hasHiddenExams = totalExamCount > examRows.length;
    }

    const selectedParam = input.exame ?? input.editar ?? exams[0]?.id ?? null;
    const selectedRow = selectedParam
      ? examRows.find((exam) => exam.id === selectedParam) ?? null
      : null;

    const selectedDetail = selectedRow
      ? await buildDetailViewModel(
          supabase,
          selectedRow,
          accessByExam.get(selectedRow.id) ?? [],
          creatorNames,
          copy,
        )
      : null;

    let editingExam: ExamDetailViewModel | null = null;
    if (canManage && input.editar) {
      const editRow = examRows.find((exam) => exam.id === input.editar) ?? null;
      if (editRow) {
        editingExam = await buildDetailViewModel(
          supabase,
          editRow,
          accessByExam.get(editRow.id) ?? [],
          creatorNames,
          copy,
        );
      }
    }

    const openModal = canManage && input.modal === "exame";

    return {
      ok: true,
      data: {
        exams,
        selectedExamId: selectedDetail?.id ?? null,
        selectedDetail,
        members: memberOptions.filter((member) => !member.isAdmin),
        canManage,
        isPaused,
        careRecipientId: ctx.careRecipientId,
        openModal,
        editingExam,
        hasHiddenExams,
        totalExamCount,
        storageUsageBytes: totalBytes,
        accountPlan: shell.accountPlan,
      },
    };
  } catch {
    return { ok: false, message: familyContent.exames.loadError };
  }
}

export { familyRoutes };
