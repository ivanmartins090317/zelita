"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canManageExams } from "./can-manage-exams";
import { isExamCategory } from "../domain/exam-categories";
import { wouldExceedQuota } from "../domain/storage-quota";
import {
  deleteExamRecord,
  fetchExamById,
  fetchTotalExamBytes,
  insertExam,
  updateExamRecord,
} from "../infrastructure/exam-repo";
import {
  deleteExamBlob,
  validateExamUpload,
} from "../infrastructure/exam-storage";
import {
  buildSharePublicPath,
  insertExamShareLink,
  type ShareLinkDuration,
} from "../infrastructure/exam-share-repo";

export interface ExamActionResult {
  ok: boolean;
  message?: string;
  examId?: string;
  shareUrl?: string;
}

const examMetadataSchema = z.object({
  careRecipientId: z.string().uuid(),
  title: z.string().min(2, "Informe o nome do exame."),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data do exame."),
  providerName: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
  storagePath: z.string().min(1),
  originalFileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.coerce.number().positive(),
  memberProfileIds: z.string().optional(),
});

async function requireExamAdmin() {
  const ctx = await getFamilyContext();
  if (!ctx.accountId || !ctx.role || !canManageExams(ctx.role)) {
    throw new Error(
      "Só quem administra a conta pode enviar ou excluir exames.",
    );
  }
  if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
    throw new Error(
      "Conta pausada: envio e exclusão de exames ficam bloqueados até reativar.",
    );
  }
  return ctx;
}

function parseMemberIds(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

function parseCategory(raw: string | undefined) {
  if (!raw) return null;
  return isExamCategory(raw) ? raw : null;
}

export async function saveExamAction(
  _prev: ExamActionResult,
  formData: FormData,
): Promise<ExamActionResult> {
  try {
    const ctx = await requireExamAdmin();
    const parsed = examMetadataSchema.safeParse({
      careRecipientId: formData.get("careRecipientId"),
      title: formData.get("title"),
      examDate: formData.get("examDate"),
      providerName: formData.get("providerName") || undefined,
      category: formData.get("category") || undefined,
      notes: formData.get("notes") || undefined,
      storagePath: formData.get("storagePath"),
      originalFileName: formData.get("originalFileName"),
      mimeType: formData.get("mimeType"),
      sizeBytes: formData.get("sizeBytes"),
      memberProfileIds: formData.get("memberProfileIds") || undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message };
    }

    if (ctx.careRecipientId !== parsed.data.careRecipientId) {
      return { ok: false, message: "Pessoa cuidada inválida para esta conta." };
    }

    const uploadError = validateExamUpload(
      parsed.data.mimeType,
      parsed.data.sizeBytes,
    );
    if (uploadError) {
      return { ok: false, message: uploadError };
    }

    const supabase = await createSupabaseServerClient();
    const { data: account } = await supabase
      .from("accounts")
      .select("plan")
      .eq("id", ctx.accountId)
      .maybeSingle();

    const currentUsage = await fetchTotalExamBytes(
      supabase,
      parsed.data.careRecipientId,
    );
    if (
      wouldExceedQuota(currentUsage, parsed.data.sizeBytes, account?.plan as string)
    ) {
      await deleteExamBlob(supabase, parsed.data.storagePath).catch(() => undefined);
      return {
        ok: false,
        message:
          "Espaço de armazenamento esgotado. Exclua arquivos antigos ou aguarde Meu plano para ampliar a cota.",
      };
    }

    const exam = await insertExam(supabase, {
      careRecipientId: parsed.data.careRecipientId,
      title: parsed.data.title.trim(),
      examDate: parsed.data.examDate,
      providerName: parsed.data.providerName?.trim() || null,
      category: parseCategory(parsed.data.category),
      notes: parsed.data.notes?.trim() || null,
      storagePath: parsed.data.storagePath,
      originalFileName: parsed.data.originalFileName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      createdBy: ctx.userId,
      memberProfileIds: parseMemberIds(parsed.data.memberProfileIds),
    });

    revalidatePath(familyRoutes.exames);
    revalidatePath(familyRoutes.hoje);

    return { ok: true, examId: exam.id };
  } catch (error) {
    const storagePath = formData.get("storagePath");
    if (typeof storagePath === "string" && storagePath) {
      const supabase = await createSupabaseServerClient();
      await deleteExamBlob(supabase, storagePath).catch(() => undefined);
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Falha ao salvar exame.",
    };
  }
}

export async function updateExamAction(
  _prev: ExamActionResult,
  formData: FormData,
): Promise<ExamActionResult> {
  try {
    await requireExamAdmin();
    const examId = String(formData.get("examId") ?? "");
    if (!examId) {
      return { ok: false, message: "Exame inválido." };
    }

    const parsed = examMetadataSchema
      .omit({
        storagePath: true,
        originalFileName: true,
        mimeType: true,
        sizeBytes: true,
      })
      .extend({ examId: z.string().uuid() })
      .safeParse({
        examId,
        careRecipientId: formData.get("careRecipientId"),
        title: formData.get("title"),
        examDate: formData.get("examDate"),
        providerName: formData.get("providerName") || undefined,
        category: formData.get("category") || undefined,
        notes: formData.get("notes") || undefined,
        memberProfileIds: formData.get("memberProfileIds") || undefined,
      });

    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message };
    }

    const supabase = await createSupabaseServerClient();
    await updateExamRecord(supabase, {
      examId: parsed.data.examId,
      title: parsed.data.title.trim(),
      examDate: parsed.data.examDate,
      providerName: parsed.data.providerName?.trim() || null,
      category: parseCategory(parsed.data.category),
      notes: parsed.data.notes?.trim() || null,
      memberProfileIds: parseMemberIds(parsed.data.memberProfileIds),
    });

    revalidatePath(familyRoutes.exames);
    revalidatePath(familyRoutes.hoje);

    return { ok: true, examId: parsed.data.examId };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Falha ao atualizar exame.",
    };
  }
}

export async function deleteExamAction(examId: string): Promise<ExamActionResult> {
  try {
    await requireExamAdmin();
    const supabase = await createSupabaseServerClient();
    const deleted = await deleteExamRecord(supabase, examId);
    await deleteExamBlob(supabase, deleted.storagePath).catch(() => undefined);

    revalidatePath(familyRoutes.exames);
    revalidatePath(familyRoutes.hoje);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Falha ao excluir exame.",
    };
  }
}

export async function cleanupOrphanUploadAction(
  storagePath: string,
): Promise<ExamActionResult> {
  try {
    await requireExamAdmin();
    const supabase = await createSupabaseServerClient();
    await deleteExamBlob(supabase, storagePath);
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

export async function createExamShareAction(
  _prev: ExamActionResult,
  formData: FormData,
): Promise<ExamActionResult> {
  try {
    const ctx = await requireExamAdmin();
    const examId = String(formData.get("examId") ?? "");
    const duration = String(formData.get("duration") ?? "") as ShareLinkDuration;

    if (!examId || !["1h", "4h", "today"].includes(duration)) {
      return { ok: false, message: "Escolha uma validade para o link." };
    }

    const supabase = await createSupabaseServerClient();
    const exam = await fetchExamById(supabase, examId);
    if (!exam) {
      return { ok: false, message: "Exame não encontrado." };
    }

    const link = await insertExamShareLink(supabase, {
      examId,
      duration,
      createdBy: ctx.userId,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const shareUrl = `${baseUrl}${buildSharePublicPath(link.token)}`;

    return { ok: true, shareUrl };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Falha ao gerar link.",
    };
  }
}

export async function getExamDownloadUrlAction(
  examId: string,
): Promise<ExamActionResult & { downloadUrl?: string }> {
  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, message: "Sessão inválida." };
    }

    const supabase = await createSupabaseServerClient();
    const exam = await fetchExamById(supabase, examId);
    if (!exam) {
      return { ok: false, message: "Exame não encontrado." };
    }

    const { createSignedExamUrl } = await import("../infrastructure/exam-storage");
    const downloadUrl = await createSignedExamUrl(supabase, exam.storagePath);

    return { ok: true, downloadUrl };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Falha ao baixar arquivo.",
    };
  }
}
