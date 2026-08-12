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

interface SignupManagerStepProps {
  managerName: string;
  managerWhatsapp: string;
  fieldErrors: { managerName?: string; managerWhatsapp?: string };
  onManagerNameChange: (value: string) => void;
  onManagerWhatsappChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SignupManagerStep({
  managerName,
  managerWhatsapp,
  fieldErrors,
  onManagerNameChange,
  onManagerWhatsappChange,
  onBack,
  onContinue,
}: SignupManagerStepProps) {
  const copy = signupContent.manager;

  return (
    <SignupStepShell onBack={onBack} onContinue={onContinue}>
      <SignupStepTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="space-y-4">
        <Field label={copy.nameLabel} htmlFor="manager-name">
          <Input
            id="manager-name"
            value={managerName}
            onChange={(event) => onManagerNameChange(event.target.value)}
            className="text-[17px]"
          />
        </Field>
        {fieldErrors.managerName ? (
          <Note tone="warning" icon="⚠️">
            {fieldErrors.managerName}
          </Note>
        ) : null}
        <Field label={copy.whatsappLabel} htmlFor="manager-whatsapp">
          <Input
            id="manager-whatsapp"
            value={managerWhatsapp}
            onChange={(event) =>
              onManagerWhatsappChange(formatPhoneBR(event.target.value))
            }
            inputMode="tel"
            className="text-[17px]"
          />
        </Field>
        <p className="text-compact text-muted">{copy.whatsappHint}</p>
        {fieldErrors.managerWhatsapp ? (
          <Note tone="warning" icon="⚠️">
            {fieldErrors.managerWhatsapp}
          </Note>
        ) : null}
      </div>
    </SignupStepShell>
  );
}
