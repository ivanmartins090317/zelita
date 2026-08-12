"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip, Chips } from "@/components/ui/chips";
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

const TIME_OPTIONS = ["08:00", "12:00", "18:00", "22:00"] as const;

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
  replacement?: PackModalReplacementContext | null;
  onClose: () => void;
}

interface PackModalFormProps {
  mode: "new" | "replacement";
  careRecipientId: string;
  replacement?: PackModalReplacementContext | null;
}

function PackModalForm({
  mode,
  careRecipientId,
  replacement,
}: PackModalFormProps) {
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
      ? replacement.times
      : ["08:00"],
  );
  const [instructions, setInstructions] = useState("");

  const action = isReplacement ? registerReplacementPack : createMedicationWithPack;
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
  const canSubmit = preview.ok && timesValid && !pending;

  function toggleTime(time: string) {
    setSelectedTimes((current) => {
      if (current.includes(time)) {
        return current.filter((value) => value !== time);
      }
      if (current.length >= dosesPerDay) {
        return [...current.slice(1), time];
      }
      return [...current, time];
    });
  }

  return (
    <form id="pack-modal-form" action={formAction} className="space-y-4">
      {isReplacement ? (
        <input type="hidden" name="medicationId" value={replacement.medicationId} />
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label={copy.fields.quantity} htmlFor="pack-quantity">
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
        <Field label={copy.fields.doseUnits} htmlFor="pack-dose-units">
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
        <Field label={copy.fields.dosesPerDay} htmlFor="pack-doses-per-day">
          <Input
            id="pack-doses-per-day"
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
        <Input
          id="pack-start"
          name="startDate"
          type="date"
          required
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </Field>

      <Field label={copy.fields.times}>
        <Chips>
          {TIME_OPTIONS.map((time) => (
            <Chip
              key={time}
              type="button"
              selected={selectedTimes.includes(time)}
              disabled={Boolean(isReplacement)}
              onClick={() => toggleTime(time)}
            >
              {time}
            </Chip>
          ))}
        </Chips>
        <input type="hidden" name="times" value={selectedTimes.join(",")} />
        {!timesValid ? (
          <p className="mt-2 text-sm text-red-700">
            {copy.timesMismatch.replace("{count}", String(dosesPerDay))}
          </p>
        ) : null}
      </Field>

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
              <p className="text-compact font-bold text-muted">{copy.previewDaily}</p>
              <p className="font-bold text-brand-900">{preview.dailyLabel}</p>
            </div>
            <div>
              <p className="text-compact font-bold text-muted">{copy.previewDuration}</p>
              <p className="font-bold text-brand-900">{preview.durationDays} dias</p>
            </div>
            <div>
              <p className="text-compact font-bold text-muted">{copy.previewEnd}</p>
              <p className="font-bold text-brand-900">
                {formatDisplayDate(preview.endDate)}
              </p>
            </div>
            <div>
              <p className="text-compact font-bold text-muted">{copy.previewBuyUntil}</p>
              <p className="font-bold text-brand-900">
                {formatDisplayDate(preview.buyUntilDate)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-amber-900">{preview.message}</p>
        )}
      </div>

      {state.message && !state.ok ? (
        <p className="text-sm text-red-700">{state.message}</p>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-line-2 pt-4">
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {pending ? copy.saving : copy.save}
        </Button>
      </div>
    </form>
  );
}

function PackModal({
  open,
  mode,
  careRecipientId,
  replacement,
  onClose,
}: PackModalProps) {
  const copy = familyContent.remedios.modal;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "replacement" ? copy.titleReplacement : copy.titleNew}
      className="w-[min(100%,520px)]"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {copy.cancel}
          </Button>
        </div>
      }
    >
      {open ? (
        <PackModalForm
          key={`${mode}-${replacement?.medicationId ?? "new"}`}
          mode={mode}
          careRecipientId={careRecipientId}
          replacement={replacement}
        />
      ) : null}
    </Modal>
  );
}

export { PackModal, type PackModalReplacementContext };
