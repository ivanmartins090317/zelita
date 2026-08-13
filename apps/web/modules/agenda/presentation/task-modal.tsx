"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import {
  saveTaskAction,
  type AgendaActionResult,
} from "@/modules/agenda/application/agenda-actions";
import type { ConsultasPageViewModel } from "@/modules/agenda/application/get-consultas-page";
import type { AgendaMemberOption } from "@/modules/agenda/application/get-consultas-page";
import { TASK_TYPES } from "@/modules/agenda/domain/task-types";

const initialState: AgendaActionResult = { ok: false };

interface TaskModalProps {
  open: boolean;
  careRecipientId: string;
  members: AgendaMemberOption[];
  appointments: Array<{ id: string; label: string }>;
  editing: ConsultasPageViewModel["editingTask"];
  onClose: () => void;
}

interface TaskModalFormProps {
  careRecipientId: string;
  members: AgendaMemberOption[];
  appointments: Array<{ id: string; label: string }>;
  editing: ConsultasPageViewModel["editingTask"];
  onClose: () => void;
}

function TaskModalForm({
  careRecipientId,
  members,
  appointments,
  editing,
  onClose,
}: TaskModalFormProps) {
  const copy = familyContent.consultas.taskModal;
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? "");
  const [state, formAction, pending] = useActionState(
    saveTaskAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  return (
    <>
      <form id="task-form" action={formAction} className="space-y-4">
        <input type="hidden" name="careRecipientId" value={careRecipientId} />
        {editing ? <input type="hidden" name="taskId" value={editing.id} /> : null}

        <Field label={copy.titleLabel} htmlFor="task-title">
          <Input
            id="task-title"
            name="title"
            placeholder={copy.titlePlaceholder}
            defaultValue={editing?.title ?? ""}
            required
          />
        </Field>

        <Field label={copy.typeLabel} htmlFor="task-type">
          <select
            id="task-type"
            name="taskType"
            className="w-full rounded-field border border-line px-3 py-2 text-body"
            defaultValue={editing?.taskType ?? TASK_TYPES.other}
          >
            {copy.types.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={copy.dueLabel} htmlFor="task-due">
          <DatePickerField
            id="task-due"
            name="dueDate"
            value={dueDate}
            onChange={setDueDate}
          />
        </Field>

        <Field label={copy.assigneeLabel} htmlFor="task-assignee">
          <select
            id="task-assignee"
            name="assigneeProfileId"
            className="w-full rounded-field border border-line px-3 py-2 text-body"
            defaultValue={editing?.assigneeProfileId ?? ""}
          >
            <option value="">{copy.assigneeNone}</option>
            {members.map((member) => (
              <option key={member.profileId} value={member.profileId}>
                {member.displayName}
              </option>
            ))}
          </select>
        </Field>

        <Field label={copy.linkAppointmentLabel} htmlFor="task-appointment">
          <select
            id="task-appointment"
            name="appointmentId"
            className="w-full rounded-field border border-line px-3 py-2 text-body"
            defaultValue={editing?.appointmentId ?? ""}
          >
            <option value="">{copy.linkAppointmentNone}</option>
            {appointments.map((appt) => (
              <option key={appt.id} value={appt.id}>
                {appt.label}
              </option>
            ))}
          </select>
        </Field>

        {state.message && !state.ok ? (
          <p className="text-sm text-coral" role="alert">
            {state.message}
          </p>
        ) : null}
      </form>
      <div className="mt-4 flex justify-end gap-2 border-t border-line-2 pt-4">
        <Button variant="secondary" type="button" onClick={onClose}>
          {copy.cancel}
        </Button>
        <Button form="task-form" type="submit" disabled={pending}>
          {pending ? copy.saving : copy.save}
        </Button>
      </div>
    </>
  );
}

function TaskModal({
  open,
  careRecipientId,
  members,
  appointments,
  editing,
  onClose,
}: TaskModalProps) {
  const copy = familyContent.consultas.taskModal;
  const isEdit = Boolean(editing);
  const formKey = editing?.id ?? "new-task";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? copy.editTitle : copy.newTitle}
    >
      <TaskModalForm
        key={formKey}
        careRecipientId={careRecipientId}
        members={members}
        appointments={appointments}
        editing={editing}
        onClose={onClose}
      />
    </Modal>
  );
}

export { TaskModal };
