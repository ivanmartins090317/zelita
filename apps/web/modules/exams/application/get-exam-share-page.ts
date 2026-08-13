import { familyContent } from "@/content/family";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

import { fetchExamById } from "../infrastructure/exam-repo";
import {
  fetchShareLinkByToken,
  isShareLinkValid,
} from "../infrastructure/exam-share-repo";
import { createSignedExamUrl } from "../infrastructure/exam-storage";

export interface ExamSharePageViewModel {
  state: "ready" | "expired" | "invalid";
  title?: string;
  examDateLabel?: string;
  downloadUrl?: string;
  isPdf?: boolean;
  isImage?: boolean;
}

export async function getExamSharePage(
  token: string,
): Promise<ExamSharePageViewModel> {
  const copy = familyContent.exames.sharePublic;

  try {
    const supabase = createSupabaseServiceClient();
    const link = await fetchShareLinkByToken(supabase, token);

    if (!link || !isShareLinkValid(link)) {
      return { state: "expired" };
    }

    const exam = await fetchExamById(supabase, link.examId);
    if (!exam) {
      return { state: "invalid" };
    }

    const downloadUrl = await createSignedExamUrl(supabase, exam.storagePath, 600);

    return {
      state: "ready",
      title: exam.title,
      examDateLabel: exam.examDate.split("-").reverse().join("/"),
      downloadUrl,
      isPdf: exam.mimeType === "application/pdf",
      isImage: exam.mimeType.startsWith("image/"),
    };
  } catch {
    return { state: "invalid", title: copy.expiredTitle };
  }
}
