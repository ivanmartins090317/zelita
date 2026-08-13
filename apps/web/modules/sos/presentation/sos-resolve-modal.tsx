"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import {
  resolveSosAlertAction,
  type SosActionResult,
} from "@/modules/sos/application/sos-actions";

interface SosResolveModalProps {
  open: boolean;
  onClose: () => void;
  alertId: string | null;
}

function SosResolveModal({ open, onClose, alertId }: SosResolveModalProps) {
  const copy = familyContent.pedidosDeAjuda.resolve;
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleClose = () => {
    setNote("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!alertId) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("alertId", alertId);
      if (note.trim()) {
        formData.set("resolutionNote", note.trim());
      }

      const result: SosActionResult = await resolveSosAlertAction(
        { ok: false },
        formData,
      );

      if (result.ok) {
        handleClose();
        return;
      }

      setError(result.message ?? copy.cancel);
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={copy.title}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            {copy.cancel}
          </Button>
          <Button
            variant="emergency"
            className="flex-1"
            onClick={handleSubmit}
            disabled={pending || !alertId}
          >
            {pending ? copy.saving : copy.confirm}
          </Button>
        </div>
      }
    >
      <Field label={copy.noteLabel} error={error ?? undefined}>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-line bg-white px-3 py-2 text-body text-ink"
          placeholder={copy.notePlaceholder}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
        />
      </Field>
    </Modal>
  );
}

export { SosResolveModal };
