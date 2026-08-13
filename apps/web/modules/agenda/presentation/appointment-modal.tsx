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
  cancelAppointmentAction,
  saveAppointmentAction,
  type AgendaActionResult,
} from "@/modules/agenda/application/agenda-actions";
import type { ConsultasPageViewModel } from "@/modules/agenda/application/get-consultas-page";
import type { AgendaMemberOption } from "@/modules/agenda/application/get-consultas-page";
import { APPOINTMENT_TYPES } from "@/modules/agenda/domain/appointment-types";

const initialState: AgendaActionResult = { ok: false };

const APPOINTMENT_TIME_OPTIONS = [
  "07:00",
  "07:30",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

function parseStartsAtLocal(value: string | undefined): {
  date: string;
  time: string;
} {
  if (!value) return { date: "", time: "08:00" };
  const [datePart, timePart] = value.split("T");
  const time = timePart?.slice(0, 5) ?? "08:00";
  return { date: datePart ?? "", time };
}

function normalizeTimeValue(raw: string): string {
  const [hours, minutes] = raw.split(":");
  const h = Number(hours);
  const m = Number(minutes);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return raw;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildStartsAtValue(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time}:00.000-03:00`;
}

interface AppointmentModalProps {
  open: boolean;
  careRecipientId: string;
  members: AgendaMemberOption[];
  editing: ConsultasPageViewModel["editingAppointment"];
  onClose: () => void;
}

interface AppointmentModalFormProps {
  careRecipientId: string;
  members: AgendaMemberOption[];
  editing: ConsultasPageViewModel["editingAppointment"];
  onClose: () => void;
}

function AppointmentModalForm({
  careRecipientId,
  members,
  editing,
  onClose,
}: AppointmentModalFormProps) {
  const copy = familyContent.consultas.appointmentModal;
  const initial = parseStartsAtLocal(editing?.startsAtLocal);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [state, formAction, pending] = useActionState(
    saveAppointmentAction,
    initialState,
  );
  const [cancelState, cancelAction, cancelling] = useActionState(
    cancelAppointmentAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok || cancelState.ok) onClose();
  }, [state.ok, cancelState.ok, onClose]);

  const startsAt = buildStartsAtValue(date, time);
  const isEdit = Boolean(editing);

  return (
    <>
      <form id="appointment-form" action={formAction} className="space-y-4">
        <input type="hidden" name="careRecipientId" value={careRecipientId} />
        <input type="hidden" name="startsAt" value={startsAt} required />
        {editing ? (
          <input type="hidden" name="appointmentId" value={editing.id} />
        ) : null}

        <Field label={copy.titleLabel} htmlFor="appt-title">
          <Input
            id="appt-title"
            name="title"
            placeholder={copy.titlePlaceholder}
            defaultValue={editing?.title ?? ""}
            required
          />
        </Field>

        <Field label={copy.specialtyLabel} htmlFor="appt-specialty">
          <Input
            id="appt-specialty"
            name="specialty"
            placeholder={copy.specialtyPlaceholder}
            defaultValue={editing?.specialty ?? ""}
          />
        </Field>

        <Field label={copy.typeLabel} htmlFor="appt-type">
          <select
            id="appt-type"
            name="appointmentType"
            className="w-full rounded-field border border-line px-3 py-2 text-body"
            defaultValue={editing?.appointmentType ?? APPOINTMENT_TYPES.medical}
          >
            {copy.types.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={copy.dateLabel} htmlFor="appt-date">
          <DatePickerField
            id="appt-date"
            value={date}
            onChange={setDate}
            required
          />
        </Field>

        <Field
          label={copy.timeLabel}
          htmlFor="appt-time"
          hint={copy.timeOtherLabel}
        >
          <Chips className="mb-3">
            {APPOINTMENT_TIME_OPTIONS.map((option) => (
              <Chip
                key={option}
                type="button"
                selected={time === option}
                onClick={() => setTime(option)}
              >
                {option}
              </Chip>
            ))}
          </Chips>
          <Input
            id="appt-time"
            type="time"
            value={time}
            onChange={(event) =>
              setTime(normalizeTimeValue(event.target.value))
            }
            required
          />
        </Field>

        <Field label={copy.locationLabel} htmlFor="appt-location">
          <Input
            id="appt-location"
            name="location"
            placeholder={copy.locationPlaceholder}
            defaultValue={editing?.location ?? ""}
          />
        </Field>

        <Field label={copy.companionLabel} htmlFor="appt-companion">
          <select
            id="appt-companion"
            name="companionProfileId"
            className="w-full rounded-field border border-line px-3 py-2 text-body"
            defaultValue={editing?.companionProfileId ?? ""}
          >
            <option value="">{copy.companionNone}</option>
            {members.map((member) => (
              <option key={member.profileId} value={member.profileId}>
                {member.displayName}
              </option>
            ))}
          </select>
        </Field>

        <Field label={copy.preparationLabel} htmlFor="appt-prep">
          <Input
            id="appt-prep"
            name="preparationNote"
            placeholder={copy.preparationPlaceholder}
            defaultValue={editing?.preparationNote ?? ""}
          />
        </Field>

        {state.message && !state.ok ? (
          <p className="text-sm text-coral" role="alert">
            {state.message}
          </p>
        ) : null}
        {cancelState.message && !cancelState.ok ? (
          <p className="text-sm text-coral" role="alert">
            {cancelState.message}
          </p>
        ) : null}
      </form>

      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-line-2 pt-4">
        {isEdit ? (
          <form action={cancelAction} className="mr-auto">
            <input type="hidden" name="appointmentId" value={editing?.id} />
            <Button
              variant="secondary"
              type="submit"
              disabled={cancelling}
              className="text-coral"
            >
              {copy.cancelAppointment}
            </Button>
          </form>
        ) : null}
        <Button variant="secondary" type="button" onClick={onClose}>
          {copy.cancel}
        </Button>
        <Button form="appointment-form" type="submit" disabled={pending}>
          {pending ? copy.saving : copy.save}
        </Button>
      </div>
    </>
  );
}

function AppointmentModal({
  open,
  careRecipientId,
  members,
  editing,
  onClose,
}: AppointmentModalProps) {
  const copy = familyContent.consultas.appointmentModal;
  const isEdit = Boolean(editing);
  const formKey = editing?.id ?? "new-appointment";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? copy.editTitle : copy.newTitle}
    >
      <AppointmentModalForm
        key={formKey}
        careRecipientId={careRecipientId}
        members={members}
        editing={editing}
        onClose={onClose}
      />
    </Modal>
  );
}

export { AppointmentModal };
