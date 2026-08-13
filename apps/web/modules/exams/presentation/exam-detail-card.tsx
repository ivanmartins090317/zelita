"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { ExamDetailViewModel } from "@/modules/exams/application/get-exames-page";
import {
  deleteExamAction,
  getExamDownloadUrlAction,
} from "@/modules/exams/application/exam-actions";

interface ExamDetailCardProps {
  detail: ExamDetailViewModel | null;
  canManage: boolean;
  isPaused: boolean;
  onEdit: () => void;
  onShare: () => void;
  onDeleted: () => void;
}

function ExamDetailCard({
  detail,
  canManage,
  isPaused,
  onEdit,
  onShare,
  onDeleted,
}: ExamDetailCardProps) {
  const copy = familyContent.exames;
  const [pending, startTransition] = useTransition();

  if (!detail) {
    return (
      <Card className="min-h-[320px]">
        <CardBody className="flex min-h-[280px] items-center justify-center text-secondary text-muted">
          {copy.table.selectPrompt}
        </CardBody>
      </Card>
    );
  }

  function handleDownload() {
    startTransition(async () => {
      const result = await getExamDownloadUrlAction(detail!.id);
      if (result.ok && result.downloadUrl) {
        window.open(result.downloadUrl, "_blank", "noopener,noreferrer");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(copy.detail.deleteConfirm)) return;
    startTransition(async () => {
      const result = await deleteExamAction(detail!.id);
      if (result.ok) onDeleted();
    });
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg">{detail.headerTitle}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="xs"
            className="min-h-11"
            onClick={handleDownload}
            disabled={pending}
          >
            {copy.detail.download}
          </Button>
          {canManage ? (
            <Button
              variant="secondary"
              size="xs"
              className="min-h-11"
              onClick={onShare}
              disabled={isPaused || pending}
            >
              {copy.detail.share}
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="flex min-h-[220px] items-center justify-center rounded-card border-2 border-dashed border-sand-3 bg-sand/40 p-4">
          {detail.previewUrl && detail.isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={detail.previewUrl}
              alt={detail.title}
              className="max-h-[320px] w-full object-contain"
            />
          ) : detail.previewUrl && detail.isPdf ? (
            <iframe
              src={detail.previewUrl}
              title={detail.title}
              className="h-[320px] w-full rounded-card bg-white"
            />
          ) : detail.previewUrl ? (
            <Button variant="secondary" asChild>
              <a href={detail.previewUrl} target="_blank" rel="noreferrer">
                {copy.detail.openNewTab}
              </a>
            </Button>
          ) : (
            <span className="text-secondary text-muted">
              {copy.detail.previewFallback}
            </span>
          )}
        </div>

        <dl className="divide-y divide-line-2 text-body">
          {[
            [copy.detail.fields.name, detail.title],
            [copy.detail.fields.examDate, detail.examDateLabel],
            [copy.detail.fields.provider, detail.providerName ?? "—"],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[140px_1fr] gap-3 py-3">
              <dt className="text-secondary text-muted">{label}</dt>
              <dd className="font-semibold text-ink">{value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[140px_1fr] gap-3 py-3">
            <dt className="text-secondary text-muted">{copy.detail.fields.category}</dt>
            <dd>
              <Tag tone={detail.categoryTone}>{detail.categoryLabel}</Tag>
              {canManage && !isPaused ? (
                <Button
                  variant="ghost"
                  size="xs"
                  className="ml-2 min-h-11"
                  onClick={onEdit}
                >
                  {copy.detail.edit}
                </Button>
              ) : null}
            </dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-3 py-3">
            <dt className="text-secondary text-muted">{copy.detail.fields.notes}</dt>
            <dd className="text-ink">{detail.notes ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-3 py-3">
            <dt className="text-secondary text-muted">Adicionado por</dt>
            <dd className="text-secondary text-muted">{detail.addedByLine}</dd>
          </div>
        </dl>

        {canManage && !isPaused ? (
          <Button
            variant="outline"
            className="min-h-11 text-coral"
            onClick={handleDelete}
            disabled={pending}
          >
            {copy.detail.delete}
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { ExamDetailCard };
