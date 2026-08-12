"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { signupContent } from "@/content/signup";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";

interface SignupEmailStepProps {
  email: string;
  errorMessage?: string;
  isSending: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function SignupEmailStep({
  email,
  errorMessage,
  isSending,
  onEmailChange,
  onSubmit,
}: SignupEmailStepProps) {
  const copy = signupContent.email;

  return (
    <SignupStepShell
      showBack={false}
      onContinue={onSubmit}
      continueLabel={
        isSending ? copy.submitPendingLabel : copy.submitLabel
      }
      continueDisabled={isSending || !email.trim()}
      continuePending={isSending}
    >
      <SignupStepTitle title={copy.title} subtitle={copy.subtitle} />
      <Field label={copy.emailLabel} htmlFor="signup-email">
        <Input
          id="signup-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={copy.emailPlaceholder}
          className="text-[17px]"
        />
      </Field>
      {errorMessage ? (
        <Note tone="warning" icon="⚠️" className="mb-4">
          {errorMessage}
        </Note>
      ) : null}
      <Note tone="info" icon={copy.trialNote.icon}>
        <strong>{copy.trialNote.title}</strong>
        {copy.trialNote.body}
      </Note>
    </SignupStepShell>
  );
}
