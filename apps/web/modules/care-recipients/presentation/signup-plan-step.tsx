"use client";

import { Note } from "@/components/ui/note";
import { OptRow } from "@/components/ui/opt-row";
import { Tag } from "@/components/ui/tag";
import { signupContent } from "@/content/signup";
import {
  SIGNUP_PLAN_CHOICES,
  type SignupPlanChoice,
} from "@/modules/care-recipients/domain/signup-options";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";

interface SignupPlanStepProps {
  planChoice: SignupPlanChoice;
  persistError?: string;
  isSubmitting: boolean;
  onPlanChange: (choice: SignupPlanChoice) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function SignupPlanStep({
  planChoice,
  persistError,
  isSubmitting,
  onPlanChange,
  onBack,
  onSubmit,
}: SignupPlanStepProps) {
  const copy = signupContent.plan;
  const isSubscribe = planChoice === SIGNUP_PLAN_CHOICES.subscribe;
  const ctaLabel = isSubmitting
    ? isSubscribe
      ? copy.subscribeCtaPending
      : copy.trialCtaPending
    : isSubscribe
      ? copy.subscribeCtaDisabled
      : copy.trialCta;

  return (
    <SignupStepShell
      onBack={onBack}
      onContinue={onSubmit}
      continueLabel={ctaLabel}
      continueDisabled={isSubmitting}
      continuePending={isSubmitting}
    >
      <SignupStepTitle title={copy.title} subtitle={copy.subtitle} />

      <div className="space-y-4">
        {copy.options.map((option) => (
          <button
            key={option.slug}
            type="button"
            className="block w-full text-left"
            onClick={() =>
              onPlanChange(option.slug as SignupPlanChoice)
            }
          >
            <OptRow
              selected={planChoice === option.slug}
              title={
                <span className="flex flex-wrap items-center gap-2">
                  <span>{option.title}</span>
                  <Tag tone={option.tag.tone}>{option.tag.label}</Tag>
                </span>
              }
              description={
                <div className="space-y-2">
                  <p>
                    <strong className="text-ink">{option.price}</strong>{" "}
                    {option.priceSuffix}
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    {option.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  {option.slug === SIGNUP_PLAN_CHOICES.subscribe ? (
                    <Note tone="warning" icon={copy.securityNote.icon}>
                      {copy.securityNote.body}
                    </Note>
                  ) : null}
                </div>
              }
            />
          </button>
        ))}
      </div>

      <Note tone="info" icon={copy.elderNote.icon} className="mt-5">
        <strong>{copy.elderNote.title}</strong>
        {copy.elderNote.body}
      </Note>

      {persistError ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {persistError}
        </Note>
      ) : null}
    </SignupStepShell>
  );
}
