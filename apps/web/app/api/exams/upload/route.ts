import { NextResponse, type NextRequest } from "next/server";

import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canManageExams } from "@/modules/exams/application/can-manage-exams";
import { fetchTotalExamBytes } from "@/modules/exams/infrastructure/exam-repo";
import {
  uploadExamBlob,
  validateExamUpload,
} from "@/modules/exams/infrastructure/exam-storage";
import { wouldExceedQuota } from "@/modules/exams/domain/storage-quota";

export async function POST(request: NextRequest) {
  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !canManageExams(ctx.role)) {
      return NextResponse.json(
        { ok: false, message: "Só quem administra a conta pode enviar exames." },
        { status: 403 },
      );
    }

    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Conta pausada: envio de exames ficou bloqueado até reativar o plano.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const careRecipientId = String(formData.get("careRecipientId") ?? "");
    const file = formData.get("file");

    if (!careRecipientId || ctx.careRecipientId !== careRecipientId) {
      return NextResponse.json(
        { ok: false, message: "Pessoa cuidada inválida." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Selecione um arquivo PDF ou foto." },
        { status: 400 },
      );
    }

    const mimeType = file.type || "application/octet-stream";
    const fileBytes = Buffer.from(await file.arrayBuffer());
    const validationError = validateExamUpload(mimeType, fileBytes.length);
    if (validationError) {
      return NextResponse.json({ ok: false, message: validationError }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: account } = await supabase
      .from("accounts")
      .select("plan")
      .eq("id", ctx.accountId)
      .maybeSingle();

    const currentUsage = await fetchTotalExamBytes(supabase, careRecipientId);
    if (wouldExceedQuota(currentUsage, fileBytes.length, account?.plan as string)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Espaço de armazenamento esgotado. Exclua arquivos antigos ou aguarde Meu plano para ampliar a cota.",
        },
        { status: 413 },
      );
    }

    const uploaded = await uploadExamBlob({
      supabase,
      accountId: ctx.accountId,
      careRecipientId,
      fileBytes,
      mimeType,
      originalFileName: file.name,
    });

    return NextResponse.json({ ok: true, data: uploaded });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar o arquivo agora.",
      },
      { status: 500 },
    );
  }
}
