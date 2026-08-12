"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { Select } from "@/components/ui/select";
import { signupContent } from "@/content/signup";
import {
  SIGNUP_RELATIONSHIPS,
  SIGNUP_RELATIONSHIP_SLUGS,
} from "@/modules/care-recipients/domain/signup-options";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";
import type { SignupWizardData } from "@/modules/care-recipients/presentation/signup-types";

interface SignupCareRecipientStepProps {
  data: Pick<
    SignupWizardData,
    "careFullName" | "careDisplayName" | "careBirthDate" | "careRelationship"
  >;
  fieldErrors: {
    careFullName?: string;
    careDisplayName?: string;
    careBirthDate?: string;
  };
  onChange: (
    patch: Partial<
      Pick<
        SignupWizardData,
        "careFullName" | "careDisplayName" | "careBirthDate" | "careRelationship"
      >
    >,
  ) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SignupCareRecipientStep({
  data,
  fieldErrors,
  onChange,
  onBack,
  onContinue,
}: SignupCareRecipientStepProps) {
  const copy = signupContent.careRecipient;

  return (
    <SignupStepShell onBack={onBack} onContinue={onContinue}>
      <SignupStepTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.fullNameLabel} htmlFor="care-full-name">
          <Input
            id="care-full-name"
            value={data.careFullName}
            onChange={(event) =>
              onChange({ careFullName: event.target.value })
            }
            className="text-[17px]"
          />
        </Field>
        <Field label={copy.displayNameLabel} htmlFor="care-display-name">
          <Input
            id="care-display-name"
            value={data.careDisplayName}
            onChange={(event) =>
              onChange({ careDisplayName: event.target.value })
            }
            className="text-[17px]"
          />
          <p className="mt-1 text-compact text-muted">{copy.displayNameHint}</p>
        </Field>
        <Field label={copy.birthDateLabel} htmlFor="care-birth-date">
          <Input
            id="care-birth-date"
            type="date"
            value={data.careBirthDate}
            onChange={(event) =>
              onChange({ careBirthDate: event.target.value })
            }
            className="text-[17px]"
          />
        </Field>
        <Field label={copy.relationshipLabel} htmlFor="care-relationship">
          <Select
            id="care-relationship"
            value={data.careRelationship}
            onChange={(event) =>
              onChange({
                careRelationship: event.target
                  .value as SignupWizardData["careRelationship"],
              })
            }
          >
            {SIGNUP_RELATIONSHIP_SLUGS.map((slug) => (
              <option key={slug} value={slug}>
                {SIGNUP_RELATIONSHIPS[slug]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {fieldErrors.careFullName ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {fieldErrors.careFullName}
        </Note>
      ) : null}
      {fieldErrors.careDisplayName ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {fieldErrors.careDisplayName}
        </Note>
      ) : null}
      {fieldErrors.careBirthDate ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {fieldErrors.careBirthDate}
        </Note>
      ) : null}
    </SignupStepShell>
  );
}
