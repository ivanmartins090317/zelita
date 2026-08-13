"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Note } from "@/components/ui/note";
import { familyContent, familyRoutes } from "@/content/family";
import type { ExamesPageViewModel } from "@/modules/exams/application/get-exames-page";
import { ExamAutoReadStubCard } from "@/modules/exams/presentation/exam-auto-read-stub-card";
import { ExamDetailCard } from "@/modules/exams/presentation/exam-detail-card";
import { ExamShareModal } from "@/modules/exams/presentation/exam-share-modal";
import { ExamTableCard } from "@/modules/exams/presentation/exam-table-card";
import { ExamUploadModal } from "@/modules/exams/presentation/exam-upload-modal";

interface ExamesPageViewProps {
  data: ExamesPageViewModel;
}

function ExamesPageView({ data }: ExamesPageViewProps) {
  const copy = familyContent.exames;
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(Boolean(data.editingExam));

  const uploadOpen = data.openModal || editOpen;
  const editingExam = editOpen ? data.selectedDetail : data.editingExam;

  const navigateExam = useCallback(
    (examId: string) => {
      router.push(`${familyRoutes.exames}?exame=${examId}`);
    },
    [router],
  );

  const closeUploadModal = useCallback(() => {
    setEditOpen(false);
    if (data.editingExam) {
      setEditOpen(false);
      router.replace(
        data.selectedExamId
          ? `${familyRoutes.exames}?exame=${data.selectedExamId}`
          : familyRoutes.exames,
      );
      return;
    }
    router.replace(familyRoutes.exames);
  }, [data.editingExam, data.selectedExamId, router]);

  const openAddModal = useCallback(() => {
    router.push(`${familyRoutes.exames}?modal=exame`);
  }, [router]);

  const handleSaved = useCallback(
    (examId: string) => {
      router.replace(`${familyRoutes.exames}?exame=${examId}`);
    },
    [router],
  );

  return (
    <>
      {!data.canManage ? (
        <Note icon="👀" tone="info" className="mb-4">
          {copy.uploadModal.viewerHint}
        </Note>
      ) : null}

      {data.canManage && data.isPaused ? (
        <Note icon="⏸" tone="warning" className="mb-4">
          {copy.uploadModal.pausedHint}
        </Note>
      ) : null}

      <ExamTableCard
        exams={data.exams}
        selectedExamId={data.selectedExamId}
        canManage={data.canManage}
        isPaused={data.isPaused}
        hasHiddenExams={data.hasHiddenExams}
        onSelect={navigateExam}
        onAddClick={openAddModal}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ExamDetailCard
          detail={data.selectedDetail}
          canManage={data.canManage}
          isPaused={data.isPaused}
          onEdit={() => setEditOpen(true)}
          onShare={() => setShareOpen(true)}
          onDeleted={() => router.replace(familyRoutes.exames)}
        />
        <ExamAutoReadStubCard />
      </div>

      {data.canManage ? (
        <>
          <ExamUploadModal
            open={uploadOpen}
            careRecipientId={data.careRecipientId}
            members={data.members}
            editing={editingExam}
            onClose={closeUploadModal}
            onSaved={handleSaved}
          />
          <ExamShareModal
            open={shareOpen}
            examId={data.selectedExamId}
            onClose={() => setShareOpen(false)}
          />
        </>
      ) : null}
    </>
  );
}

export { ExamesPageView };
