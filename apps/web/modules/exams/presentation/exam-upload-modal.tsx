"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip, Chips } from "@/components/ui/chips";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import {
  cleanupOrphanUploadAction,
  saveExamAction,
  updateExamAction,
  type ExamActionResult,
} from "@/modules/exams/application/exam-actions";
import type {
  ExamDetailViewModel,
  ExamMemberOption,
} from "@/modules/exams/application/get-exames-page";
import { EXAM_CATEGORIES } from "@/modules/exams/domain/exam-categories";

const initialState: ExamActionResult = { ok: false };

interface UploadedFileState {
  storagePath: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface ExamUploadModalProps {
  open: boolean;
  careRecipientId: string;
  members: ExamMemberOption[];
  editing?: ExamDetailViewModel | null;
  onClose: () => void;
  onSaved: (examId: string) => void;
}

function ExamUploadModal({
  open,
  careRecipientId,
  members,
  editing,
  onClose,
  onSaved,
}: ExamUploadModalProps) {
  const copy = familyContent.exames;
  const isEdit = Boolean(editing);
  const action = isEdit ? updateExamAction : saveExamAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [examDate, setExamDate] = useState(
    editing?.examDate ?? new Date().toISOString().slice(0, 10),
  );
  const [providerName, setProviderName] = useState(editing?.providerName ?? "");
  const [category, setCategory] = useState(editing?.category ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    editing?.memberProfileIds ?? [],
  );
  const [upload, setUpload] = useState<UploadedFileState | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok && state.examId) {
      onSaved(state.examId);
      onClose();
    }
  }, [state.ok, state.examId, onClose, onSaved]);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploadStatus(copy.uploadModal.uploading);

    const body = new FormData();
    body.append("careRecipientId", careRecipientId);
    body.append("file", file);

    const response = await fetch("/api/exams/upload", {
      method: "POST",
      body,
    });
    const result = (await response.json()) as {
      ok: boolean;
      message?: string;
      data?: UploadedFileState;
    };

    if (!result.ok || !result.data) {
      setUpload(null);
      setUploadStatus(null);
      setUploadError(result.message ?? copy.errors.uploadFailed);
      return;
    }

    setUpload(result.data);
    setUploadStatus(copy.uploadModal.uploaded);
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    }
  }

  async function handleClose() {
    if (upload?.storagePath && !isEdit) {
      await cleanupOrphanUploadAction(upload.storagePath);
    }
    onClose();
  }

  function toggleMember(profileId: string) {
    setSelectedMembers((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId],
    );
  }

  const canSubmit =
    Boolean(title.trim()) &&
    Boolean(examDate) &&
    (isEdit || Boolean(upload)) &&
    !pending;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={copy.uploadModal.title}
      className="w-[min(100%,520px)]"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={pending}>
            {copy.uploadModal.cancel}
          </Button>
          <Button type="submit" form="exam-upload-form" disabled={!canSubmit}>
            {pending ? copy.uploadModal.saving : copy.uploadModal.save}
          </Button>
        </>
      }
    >
      <form id="exam-upload-form" action={formAction} className="space-y-4 px-5 py-4">
        {isEdit ? <input type="hidden" name="examId" value={editing!.id} /> : null}
        <input type="hidden" name="careRecipientId" value={careRecipientId} />
        <input type="hidden" name="memberProfileIds" value={selectedMembers.join(",")} />

        {!isEdit ? (
          <div className="rounded-card border-2 border-dashed border-sand-3 bg-sand/30 p-5 text-center">
            <p className="text-secondary text-muted">
              {copy.uploadModal.dropHint}{" "}
              <label className="cursor-pointer font-semibold text-brand-600">
                {copy.uploadModal.chooseFile}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                  className="sr-only"
                  onChange={(event) =>
                    handleFileChange(event.target.files?.[0] ?? null)
                  }
                />
              </label>
            </p>
            <p className="mt-2 text-compact text-muted">{copy.uploadModal.fileHint}</p>
            {upload ? (
              <>
                <input type="hidden" name="storagePath" value={upload.storagePath} />
                <input
                  type="hidden"
                  name="originalFileName"
                  value={upload.originalFileName}
                />
                <input type="hidden" name="mimeType" value={upload.mimeType} />
                <input type="hidden" name="sizeBytes" value={upload.sizeBytes} />
                <p className="mt-3 text-sm font-semibold text-ink">
                  {upload.originalFileName}
                </p>
              </>
            ) : null}
            {uploadStatus ? (
              <p className="mt-1 text-compact text-brand-600">{uploadStatus}</p>
            ) : null}
            {uploadError ? (
              <p className="mt-2 text-compact text-coral">{uploadError}</p>
            ) : null}
          </div>
        ) : null}

        <Field label={copy.uploadModal.fields.name}>
          <Input
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </Field>

        <Field label={copy.uploadModal.fields.examDate}>
          <DatePickerField name="examDate" value={examDate} onChange={setExamDate} />
        </Field>

        <Field label={copy.uploadModal.fields.provider}>
          <Input
            name="providerName"
            value={providerName}
            onChange={(event) => setProviderName(event.target.value)}
          />
        </Field>

        <Field label={copy.uploadModal.fields.category}>
          <select
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-11 w-full rounded-input border border-line bg-white px-3 text-body"
          >
            <option value="">{copy.uploadModal.categoryPlaceholder}</option>
            {Object.values(EXAM_CATEGORIES).map((slug) => (
              <option key={slug} value={slug}>
                {copy.categories[slug]}
              </option>
            ))}
          </select>
        </Field>

        <Field label={copy.uploadModal.fields.notes}>
          <Input
            name="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

        <Field label={copy.uploadModal.fields.visibility}>
          <p className="mb-2 text-compact text-muted">{copy.visibility.adminHint}</p>
          <Chips>
            {members.map((member) => (
              <Chip
                key={member.profileId}
                selected={selectedMembers.includes(member.profileId)}
                onClick={() => toggleMember(member.profileId)}
              >
                {member.displayName}
              </Chip>
            ))}
          </Chips>
        </Field>

        {state.message && !state.ok ? (
          <p className="text-compact text-coral">{state.message}</p>
        ) : null}
      </form>
    </Modal>
  );
}

export { ExamUploadModal };
