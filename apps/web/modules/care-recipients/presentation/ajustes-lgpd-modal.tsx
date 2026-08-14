"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import { submitDataSubjectRequestAction } from "@/modules/care-recipients/application/submit-data-subject-request";
import {
  DATA_SUBJECT_REQUEST_TYPE,
  type DataSubjectRequestType,
} from "@/modules/care-recipients/infrastructure/data-subject-request-repo";

interface AjustesLgpdModalProps {
  open: boolean;
  onClose: () => void;
  canSubmit: boolean;
}

function AjustesLgpdModal({ open, onClose, canSubmit }: AjustesLgpdModalProps) {
  const copy = familyContent.ajustes.lgpdModal;
  const [requestType, setRequestType] = useState<DataSubjectRequestType>(
    DATA_SUBJECT_REQUEST_TYPE.export,
  );
  const [confirmed, setConfirmed] = useState(false);
  const [state, formAction, pending] = useActionState(
    submitDataSubjectRequestAction,
    { ok: false },
  );

  function handleClose() {
    setConfirmed(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={copy.title}
      footer={
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="requestType" value={requestType} />
          <input type="hidden" name="confirmed" value={confirmed ? "true" : "false"} />
          <label className="flex items-start gap-2 text-secondary">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1"
            />
            {copy.confirmLabel}
          </label>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit || !confirmed || pending}
            >
              {copy.submitButton}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              {copy.cancelButton}
            </Button>
          </div>
          {state.message ? (
            <p
              className={
                state.ok ? "text-secondary text-ok" : "text-secondary text-coral-dark"
              }
            >
              {state.message}
            </p>
          ) : null}
        </form>
      }
    >
      <div className="space-y-4">
        <Field label={copy.typeLabel}>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="lgpd-type"
                checked={requestType === DATA_SUBJECT_REQUEST_TYPE.export}
                onChange={() => setRequestType(DATA_SUBJECT_REQUEST_TYPE.export)}
              />
              {copy.exportOption}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="lgpd-type"
                checked={requestType === DATA_SUBJECT_REQUEST_TYPE.delete}
                onChange={() => setRequestType(DATA_SUBJECT_REQUEST_TYPE.delete)}
              />
              {copy.deleteOption}
            </label>
          </div>
        </Field>
        <Note tone="info" icon="ℹ️">
          {copy.deadlineNote}
        </Note>
      </div>
    </Modal>
  );
}

export { AjustesLgpdModal };
