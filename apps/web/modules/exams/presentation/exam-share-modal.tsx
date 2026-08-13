"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip, Chips } from "@/components/ui/chips";
import { Modal } from "@/components/ui/modal";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import {
  createExamShareAction,
  type ExamActionResult,
} from "@/modules/exams/application/exam-actions";
import type { ShareLinkDuration } from "@/modules/exams/infrastructure/exam-share-repo";

const initialState: ExamActionResult = { ok: false };

interface ExamShareModalProps {
  open: boolean;
  examId: string | null;
  onClose: () => void;
}

function ExamShareModal({ open, examId, onClose }: ExamShareModalProps) {
  const copy = familyContent.exames.shareModal;
  const [state, formAction, pending] = useActionState(
    createExamShareAction,
    initialState,
  );
  const [duration, setDuration] = useState<ShareLinkDuration>("4h");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!state.shareUrl) return;
    await navigator.clipboard.writeText(state.shareUrl);
    setCopied(true);
  }

  if (!examId) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button type="submit" form="exam-share-form" disabled={pending}>
            {pending ? copy.generating : copy.generate}
          </Button>
        </>
      }
    >
      <form id="exam-share-form" action={formAction} className="space-y-4 px-5 py-4">
        <input type="hidden" name="examId" value={examId} />
        <input type="hidden" name="duration" value={duration} />

        <p className="text-secondary text-muted">{copy.body}</p>

        <Chips>
          {(Object.keys(copy.durations) as ShareLinkDuration[]).map((key) => (
            <Chip
              key={key}
              selected={duration === key}
              onClick={() => {
                setDuration(key);
                setCopied(false);
              }}
            >
              {copy.durations[key]}
            </Chip>
          ))}
        </Chips>

        <Note icon="🔒" tone="info">
          {copy.securityNote}
        </Note>

        {state.shareUrl ? (
          <div className="space-y-2 rounded-card border border-line bg-sand/40 p-3">
            <p className="break-all text-compact text-ink">{state.shareUrl}</p>
            <Button type="button" variant="secondary" size="xs" onClick={handleCopy}>
              {copied ? copy.copied : copy.copyButton}
            </Button>
          </div>
        ) : null}

        {state.message && !state.ok ? (
          <p className="text-compact text-coral">{state.message}</p>
        ) : null}
      </form>
    </Modal>
  );
}

export { ExamShareModal };
