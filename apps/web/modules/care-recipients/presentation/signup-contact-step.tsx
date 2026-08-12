"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { signupContent } from "@/content/signup";
import { formatPhoneBR } from "@/lib/format";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";

interface SignupContactStepProps {
  careDisplayName: string;
  careWhatsapp: string;
  addressText: string;
  fieldErrors: { careWhatsapp?: string; addressText?: string };
  onCareWhatsappChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SignupContactStep({
  careDisplayName,
  careWhatsapp,
  addressText,
  fieldErrors,
  onCareWhatsappChange,
  onAddressChange,
  onBack,
  onContinue,
}: SignupContactStepProps) {
  const copy = signupContent.contact;
  const title = careDisplayName.trim()
    ? copy.titleWithName.replace("{name}", careDisplayName.trim())
    : copy.title;

  return (
    <SignupStepShell onBack={onBack} onContinue={onContinue}>
      <SignupStepTitle title={title} subtitle={copy.subtitle} />
      <div className="space-y-4">
        <Field label={copy.whatsappLabel} htmlFor="care-whatsapp">
          <Input
            id="care-whatsapp"
            value={careWhatsapp}
            onChange={(event) =>
              onCareWhatsappChange(formatPhoneBR(event.target.value))
            }
            inputMode="tel"
            className="text-[17px]"
          />
          <p className="mt-1 text-compact text-muted">{copy.whatsappHint}</p>
        </Field>
        {fieldErrors.careWhatsapp ? (
          <Note tone="warning" icon="⚠️">
            {fieldErrors.careWhatsapp}
          </Note>
        ) : null}
        <Field label={copy.addressLabel} htmlFor="address-text">
          <Input
            id="address-text"
            value={addressText}
            onChange={(event) => onAddressChange(event.target.value)}
            className="text-[17px]"
          />
          <p className="mt-1 text-compact text-muted">{copy.addressHint}</p>
        </Field>
        {fieldErrors.addressText ? (
          <Note tone="warning" icon="⚠️">
            {fieldErrors.addressText}
          </Note>
        ) : null}
      </div>
    </SignupStepShell>
  );
}
