"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import {
  createMedicationWithPack,
  registerReplacementPack,
  type MedicationActionResult,
} from "@/modules/medications/application/medication-actions";
import {
  buildPackPreview,
  formatDisplayDate,
} from "@/modules/medications/domain/remedios-display";
import { PackTimeField, sortTimes } from "@/modules/medications/presentation/pack-time-field";

const initialState: MedicationActionResult = { ok: false };

interface PackModalReplacementContext {
  medicationId: string;
  name: string;
  dosageLabel: string;
  times: string[];
  doseUnits: number;
  dosesPerDay: number;
}

interface PackModalProps {
  open: boolean;
  mode: "new" | "replacement";
  careRecipientId: string;
  isPaused?: boolean;
  replacement?: PackModalReplacementContext | null;
  onClose: () => void;
}

interface PackModalContentProps {
  mode: "new" | "replacement";
  careRecipientId: string;
  isPaused?: boolean;
  replacement?: PackModalReplacementContext | null;
  onClose: () => void;
}

function PackModalContent({
  mode,
  careRecipientId,
  isPaused = false,
  replacement,
  onClose,
}: PackModalContentProps) {
  const copy = familyContent.remedios.modal;
  const isReplacement = mode === "replacement" && replacement;

  const [quantityTotal, setQuantityTotal] = useState(30);
  const [doseUnits, setDoseUnits] = useState(
    isReplacement ? replacement.doseUnits : 1,
  );
  const [dosesPerDay, setDosesPerDay] = useState(
    isReplacement ? replacement.dosesPerDay : 1,
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    isReplacement && replacement.times.length > 0
      ? sortTimes(replacement.times)
      : ["08:00"],
  );
  const [instructions, setInstructions] = useState("");

  const action = isReplacement
    ? registerReplacementPack
    : createMedicationWithPack;
  const [state, formAction, pending] = useActionState(action, initialState);

  const preview = useMemo(
    () =>
      buildPackPreview({
        quantityTotal,
        doseUnits,
        dosesPerDay,
        startDate,
        invalidCopy: copy.previewInvalid,
      }),
    [quantityTotal, doseUnits, dosesPerDay, startDate, copy.previewInvalid],
  );

  const timesValid = selectedTimes.length === dosesPerDay;
  const canSubmit =
    preview.ok && timesValid && !pending && Boolean(startDate) && !isPaused;

  return (
    <Modal
      open
      onClose={onClose}
      title={mode === "replacement" ? copy.titleReplacement : copy.titleNew}
      className="w-[min(100%,520px)]"
      footerClassName="bg-sand-2"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            form="pack-modal-form"
            size="sm"
            disabled={!canSubmit}
          >
            {pending ? copy.saving : copy.save}
          </Button>
        </div>
      }
    >
      <form id="pack-modal-form" action={formAction} className="space-y-4">
        {isReplacement ? (
          <input
            type="hidden"
            name="medicationId"
            value={replacement.medicationId}
          />
        ) : (
          <input type="hidden" name="careRecipientId" value={careRecipientId} />
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={copy.fields.name} htmlFor="pack-name">
            <Input
              id="pack-name"
              name={isReplacement ? undefined : "name"}
              required={!isReplacement}
              readOnly={Boolean(isReplacement)}
              defaultValue={isReplacement ? replacement.name : undefined}
              placeholder="Losartana"
            />
          </Field>
          <Field label={copy.fields.dosage} htmlFor="pack-dosage">
            <Input
              id="pack-dosage"
              name={isReplacement ? undefined : "dosageLabel"}
              required={!isReplacement}
              readOnly={Boolean(isReplacement)}
              defaultValue={isReplacement ? replacement.dosageLabel : undefined}
              placeholder="50 mg"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Field
            label={copy.fields.quantity}
            htmlFor="pack-quantity"
            className="mb-0 [&_label]:text-compact"
          >
            <Input
              id="pack-quantity"
              name="quantityTotal"
              type="number"
              min={1}
              required
              value={quantityTotal}
              onChange={(event) => setQuantityTotal(Number(event.target.value))}
            />
          </Field>
          <Field
            label={copy.fields.doseUnits}
            htmlFor="pack-dose-units"
            className="mb-0 [&_label]:text-compact"
          >
            <Input
              id="pack-dose-units"
              name="doseUnits"
              type="number"
              min={0.5}
              step="0.5"
              required
              value={doseUnits}
              onChange={(event) => setDoseUnits(Number(event.target.value))}
            />
          </Field>
          <Field
            label={copy.fields.dosesPerDay}
            htmlFor="pack-doses-per-day"
            className="mb-0 [&_label]:text-compact"
          >
            <Input
              id="pack-doses-per-day"
              className="mt-5.5"
              name="dosesPerDay"
              type="number"
              min={1}
              required
              readOnly={Boolean(isReplacement)}
              value={dosesPerDay}
              onChange={(event) => setDosesPerDay(Number(event.target.value))}
            />
          </Field>
        </div>

        <Field label={copy.fields.startDate} htmlFor="pack-start">
          <DatePickerField
            id="pack-start"
            name="startDate"
            required
            value={startDate}
            onChange={setStartDate}
          />
        </Field>

        <PackTimeField
          dosesPerDay={dosesPerDay}
          selectedTimes={selectedTimes}
          readOnly={Boolean(isReplacement)}
          onChange={setSelectedTimes}
        />

        {!isReplacement ? (
          <Field label={copy.fields.instructions} htmlFor="pack-instructions">
            <Input
              id="pack-instructions"
              name="instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
          </Field>
        ) : null}

        <div className="rounded-xl bg-brand-50 px-4 py-4">
          <p className="text-label font-bold uppercase tracking-wider text-brand-700">
            {copy.previewTitle}
          </p>
          {preview.ok ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-compact font-bold text-muted">
                  {copy.previewDaily}
                </p>
                <p className="font-bold text-brand-900">{preview.dailyLabel}</p>
              </div>
              <div>
                <p className="text-compact font-bold text-muted">
                  {copy.previewDuration}
                </p>
                <p className="font-bold text-brand-900">
                  {preview.durationDays} dias
                </p>
              </div>
              <div>
                <p className="text-compact font-bold text-muted">
                  {copy.previewEnd}
                </p>
                <p className="font-bold text-brand-900">
                  {formatDisplayDate(preview.endDate)}
                </p>
              </div>
              <div>
                <p className="text-compact font-bold text-muted">
                  {copy.previewBuyUntil}
                </p>
                <p className="font-bold text-brand-900">
                  {formatDisplayDate(preview.buyUntilDate)}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-900">{preview.message}</p>
          )}
        </div>

        {isPaused ? (
          <p className="text-sm text-amber-900">{copy.pausedHint}</p>
        ) : null}

        {state.message && !state.ok ? (
          <p className="text-sm text-red-700">{state.message}</p>
        ) : null}
      </form>
    </Modal>
  );
}

function PackModal({
  open,
  mode,
  careRecipientId,
  isPaused = false,
  replacement,
  onClose,
}: PackModalProps) {
  if (!open) {
    return null;
  }

  return (
    <PackModalContent
      key={`${mode}-${replacement?.medicationId ?? "new"}`}
      mode={mode}
      careRecipientId={careRecipientId}
      isPaused={isPaused}
      replacement={replacement}
      onClose={onClose}
    />
  );
}

export { PackModal, type PackModalReplacementContext };
