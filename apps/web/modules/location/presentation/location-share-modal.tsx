"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import {
  createLocationShareAction,
  type LocationActionResult,
} from "@/modules/location/application/location-actions";
import { LOCATION_SHARE_DURATION } from "@/modules/location/domain/location-share";

interface LocationShareModalProps {
  open: boolean;
  onClose: () => void;
  careRecipientId: string;
}

const initialState: LocationActionResult = { ok: false };

function LocationShareModal({
  open,
  onClose,
  careRecipientId,
}: LocationShareModalProps) {
  const copy = familyContent.localizacao.shareModal;
  const [state, formAction, pending] = useActionState(
    createLocationShareAction,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!state.shareUrl) return;
    await navigator.clipboard.writeText(state.shareUrl);
    setCopied(true);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        state.ok && state.shareUrl ? (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              {copy.close}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {copy.cancel}
            </Button>
            <Button type="submit" form="location-share-form" disabled={pending}>
              {pending ? copy.creating : copy.confirm}
            </Button>
          </div>
        )
      }
    >
      {state.ok && state.shareUrl ? (
        <div className="space-y-4">
          <p className="text-secondary text-muted">{copy.readyBody}</p>
          <div className="break-all rounded-lg border border-line-2 bg-sand-1 px-3 py-2 text-compact">
            {state.shareUrl}
          </div>
          <Button className="min-h-11 w-full" onClick={handleCopy}>
            {copied ? copy.copied : copy.copyButton}
          </Button>
        </div>
      ) : (
        <form id="location-share-form" action={formAction} className="space-y-4">
          <input type="hidden" name="careRecipientId" value={careRecipientId} />
          <p className="text-secondary text-muted">{copy.hint}</p>

          <Field label={copy.durationLabel} htmlFor="share-duration">
            <select
              id="share-duration"
              name="duration"
              className="flex h-11 w-full rounded-input border border-line-2 bg-white px-3 text-body"
              defaultValue={LOCATION_SHARE_DURATION["1h"]}
            >
              <option value={LOCATION_SHARE_DURATION["1h"]}>
                {copy.duration1h}
              </option>
              <option value={LOCATION_SHARE_DURATION["3h"]}>
                {copy.duration3h}
              </option>
              <option value={LOCATION_SHARE_DURATION["24h"]}>
                {copy.duration24h}
              </option>
            </select>
          </Field>

          {state.message && !state.ok ? (
            <p className="text-compact text-coral">{state.message}</p>
          ) : null}
        </form>
      )}
    </Modal>
  );
}

export { LocationShareModal };
