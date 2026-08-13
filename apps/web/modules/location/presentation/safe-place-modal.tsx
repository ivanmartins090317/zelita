"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import type { SafePlaceListItem } from "@/modules/location/application/get-localizacao-page";
import {
  createSafePlaceAction,
  deleteSafePlaceAction,
  updateSafePlaceAction,
  type LocationActionResult,
} from "@/modules/location/application/location-actions";
import { LOCATION_CONSTANTS } from "@/modules/location/constants";

interface SafePlaceModalProps {
  open: boolean;
  onClose: () => void;
  careRecipientId: string;
  place: SafePlaceListItem | null;
}

const initialState: LocationActionResult = { ok: false };

function SafePlaceModal({
  open,
  onClose,
  careRecipientId,
  place,
}: SafePlaceModalProps) {
  const copy = familyContent.localizacao.placeModal;
  const isEdit = Boolean(place);

  const [createState, createFormAction, createPending] = useActionState(
    createSafePlaceAction,
    initialState,
  );
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateSafePlaceAction,
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteSafePlaceAction,
    initialState,
  );

  const result = isEdit ? updateState : createState;
  const pending = createPending || updatePending || deletePending;

  useEffect(() => {
    if (result.ok || deleteState.ok) onClose();
  }, [result.ok, deleteState.ok, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? copy.editTitle : copy.addTitle}
      footer={
        <div className="flex flex-wrap justify-between gap-2">
          {isEdit && place && !place.isHome ? (
            <form action={deleteFormAction}>
              <input type="hidden" name="placeId" value={place.id} />
              <Button type="submit" variant="secondary" disabled={deletePending}>
                {copy.deleteButton}
              </Button>
            </form>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {copy.cancel}
            </Button>
            <Button
              type="submit"
              form="safe-place-form"
              disabled={pending}
            >
              {pending ? copy.saving : copy.save}
            </Button>
          </div>
        </div>
      }
    >
      <form
        id="safe-place-form"
        action={isEdit ? updateFormAction : createFormAction}
        className="space-y-4"
      >
        <input type="hidden" name="careRecipientId" value={careRecipientId} />
        {isEdit ? <input type="hidden" name="placeId" value={place!.id} /> : null}

        <Field label={copy.nameLabel} htmlFor="place-name">
          <Input
            id="place-name"
            name="name"
            defaultValue={place?.name ?? ""}
            required
            disabled={place?.isHome}
          />
        </Field>

        <Field label={copy.addressLabel} htmlFor="place-address">
          <Input
            id="place-address"
            name="addressText"
            defaultValue={place?.addressText ?? ""}
            required
          />
        </Field>

        <Field label={copy.radiusLabel} htmlFor="place-radius">
          <Input
            id="place-radius"
            name="radiusM"
            type="number"
            min={80}
            max={200}
            defaultValue={
              place?.radiusM ??
              (place?.isHome ? LOCATION_CONSTANTS.defaultHomeRadiusM : 100)
            }
            required
          />
        </Field>

        <Field label={copy.iconLabel} htmlFor="place-icon">
          <Input
            id="place-icon"
            name="icon"
            defaultValue={place?.icon ?? ""}
            placeholder="🏠"
            maxLength={4}
          />
        </Field>

        <label className="flex items-center gap-2 text-secondary">
          <input
            type="checkbox"
            name="alertOnExit"
            value="true"
            defaultChecked={place?.alertOnExit ?? false}
            disabled={place?.alertOnExitDisabled ?? true}
          />
          {copy.alertOnExitLabel}
        </label>
        {place?.alertOnExitDisabled ? (
          <p className="text-compact text-muted">{copy.alertOnExitHint}</p>
        ) : null}

        {result.message && !result.ok ? (
          <p className="text-compact text-coral">{result.message}</p>
        ) : null}
      </form>
    </Modal>
  );
}

export { SafePlaceModal };
