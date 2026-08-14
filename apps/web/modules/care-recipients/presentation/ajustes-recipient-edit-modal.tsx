"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { familyContent } from "@/content/family";
import { formatPhoneBR } from "@/lib/format";
import { updateCareRecipientProfileAction } from "@/modules/care-recipients/application/update-care-recipient-profile";

interface AjustesRecipientEditModalProps {
  open: boolean;
  onClose: () => void;
  defaults: {
    fullName: string;
    displayName: string;
    birthDate: string;
    whatsapp: string;
    addressText: string;
  };
}

function AjustesRecipientEditModal({
  open,
  onClose,
  defaults,
}: AjustesRecipientEditModalProps) {
  const copy = familyContent.ajustes.recipient.modal;
  const [fullName, setFullName] = useState(defaults.fullName);
  const [displayName, setDisplayName] = useState(defaults.displayName);
  const [birthDate, setBirthDate] = useState(defaults.birthDate);
  const [whatsapp, setWhatsapp] = useState(
    defaults.whatsapp ? formatPhoneBR(defaults.whatsapp) : "",
  );
  const [addressText, setAddressText] = useState(defaults.addressText);
  const [state, formAction, pending] = useActionState(
    updateCareRecipientProfileAction,
    { ok: false },
  );

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        state.ok ? (
          <Button variant="secondary" size="sm" onClick={onClose}>
            {copy.cancelButton}
          </Button>
        ) : (
          <form action={formAction} className="flex gap-2">
            <input type="hidden" name="fullName" value={fullName} />
            <input type="hidden" name="displayName" value={displayName} />
            <input type="hidden" name="birthDate" value={birthDate} />
            <input type="hidden" name="whatsapp" value={whatsapp} />
            <input type="hidden" name="addressText" value={addressText} />
            <Button type="submit" size="sm" disabled={pending}>
              {copy.saveButton}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              {copy.cancelButton}
            </Button>
          </form>
        )
      }
    >
      {state.ok ? (
        <p className="text-secondary text-ok">{state.message}</p>
      ) : (
        <div className="space-y-4">
          <Field label={copy.fullNameLabel}>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            {state.fieldErrors?.fullName ? (
              <p className="text-compact text-coral-dark">{state.fieldErrors.fullName}</p>
            ) : null}
          </Field>
          <Field label={copy.displayNameLabel}>
            <Input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            {state.fieldErrors?.displayName ? (
              <p className="text-compact text-coral-dark">
                {state.fieldErrors.displayName}
              </p>
            ) : null}
          </Field>
          <Field label={copy.birthDateLabel}>
            <Input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            {state.fieldErrors?.birthDate ? (
              <p className="text-compact text-coral-dark">{state.fieldErrors.birthDate}</p>
            ) : null}
          </Field>
          <Field label={copy.whatsappLabel}>
            <Input
              value={whatsapp}
              onChange={(event) => setWhatsapp(formatPhoneBR(event.target.value))}
            />
            {state.fieldErrors?.whatsapp ? (
              <p className="text-compact text-coral-dark">{state.fieldErrors.whatsapp}</p>
            ) : null}
          </Field>
          <Field label={copy.addressLabel}>
            <Textarea
              value={addressText}
              onChange={(event) => setAddressText(event.target.value)}
              rows={3}
            />
            {state.fieldErrors?.addressText ? (
              <p className="text-compact text-coral-dark">
                {state.fieldErrors.addressText}
              </p>
            ) : null}
          </Field>
          {state.message && !state.ok ? (
            <p className="text-secondary text-coral-dark">{state.message}</p>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

export { AjustesRecipientEditModal };
