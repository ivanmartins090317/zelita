"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import type { MedicationActionResult } from "@/modules/medications/application/medication-actions";
import { updateMedicationSchedule } from "@/modules/medications/application/update-medication-schedule";
import { PackTimeField } from "@/modules/medications/presentation/pack-time-field";

const initialState: MedicationActionResult = { ok: false };

interface ScheduleModalProps {
  open: boolean;
  medicationId: string;
  name: string;
  dosageLabel: string;
  times: string[];
  dosesPerDay: number;
  isPaused?: boolean;
  onClose: () => void;
}

function ScheduleModalContent({
  medicationId,
  name,
  dosageLabel,
  times,
  dosesPerDay,
  isPaused = false,
  onClose,
}: Omit<ScheduleModalProps, "open">) {
  const copy = familyContent.remedios.scheduleModal;
  const [selectedTimes, setSelectedTimes] = useState(times);
  const [state, formAction, pending] = useActionState(
    updateMedicationSchedule,
    initialState,
  );
  const timesValid = selectedTimes.length === dosesPerDay;
  const canSubmit = timesValid && !pending && !isPaused;

  return (
    <Modal
      open
      onClose={onClose}
      title={copy.title}
      className="w-[min(100%,520px)]"
      footerClassName="bg-sand-2"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            form="schedule-modal-form"
            size="sm"
            disabled={!canSubmit}
          >
            {pending ? copy.saving : copy.save}
          </Button>
        </div>
      }
    >
      <form id="schedule-modal-form" action={formAction} className="space-y-4">
        <input type="hidden" name="medicationId" value={medicationId} />
        <p className="font-bold text-brand-900">
          {name} {dosageLabel}
        </p>
        <p className="text-sm text-muted">{copy.lead}</p>
        <PackTimeField
          dosesPerDay={dosesPerDay}
          selectedTimes={selectedTimes}
          readOnly={false}
          onChange={setSelectedTimes}
        />
        {state.message && !state.ok ? (
          <p className="text-sm text-red-700">{state.message}</p>
        ) : null}
      </form>
    </Modal>
  );
}

function ScheduleModal({ open, ...props }: ScheduleModalProps) {
  if (!open) return null;

  return <ScheduleModalContent key={props.medicationId} {...props} />;
}

export { ScheduleModal };
