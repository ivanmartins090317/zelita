"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Note } from "@/components/ui/note";
import { Select } from "@/components/ui/select";
import { familyContent } from "@/content/family";
import {
  sendInviteAction,
  type InviteActionResult,
} from "@/modules/accounts/application/invite-actions";
import type { AccountRole } from "@/modules/accounts/domain/roles";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: InviteActionResult) => void;
}

const initialState: InviteActionResult = { ok: false };

function InviteModal({ open, onClose, onSuccess }: InviteModalProps) {
  const copy = familyContent.participantes.modal;
  const [state, formAction, isPending] = useActionState(
    sendInviteAction,
    initialState,
  );
  const [role, setRole] = useState<AccountRole>("caregiver");

  useEffect(() => {
    if (state.ok) {
      onSuccess(state);
      onClose();
    }
  }, [state, onSuccess, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {copy.cancel}
          </Button>
          <Button type="submit" form="invite-form" disabled={isPending}>
            {isPending ? copy.submitting : copy.submit}
          </Button>
        </div>
      }
    >
      <form id="invite-form" action={formAction} className="space-y-4">
        <Field label={copy.nameLabel} htmlFor="invite-name">
          <Input
            id="invite-name"
            name="displayName"
            placeholder={copy.namePlaceholder}
            required
            className="text-[17px]"
          />
        </Field>

        <Field label={copy.relationshipLabel} htmlFor="invite-relationship">
          <Input
            id="invite-relationship"
            name="relationshipLabel"
            placeholder={copy.relationshipPlaceholder}
            className="text-[17px]"
          />
        </Field>

        <Field label={copy.contactLabel} htmlFor="invite-contact">
          <Input
            id="invite-contact"
            name="contact"
            placeholder={copy.contactPlaceholder}
            required
            className="text-[17px]"
          />
        </Field>

        <Field label={copy.roleLabel} htmlFor="invite-role">
          <Select
            id="invite-role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as AccountRole)}
          >
            {copy.roles.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-compact text-muted">
            {copy.roles.find((item) => item.slug === role)?.description}
          </p>
          <p className="mt-1 text-compact text-muted">{copy.rolesHint}</p>
        </Field>

        {state.ok === false && state.message ? (
          <Note tone="warning" icon="⚠️">
            {state.message}
          </Note>
        ) : null}
      </form>
    </Modal>
  );
}

export { InviteModal };
