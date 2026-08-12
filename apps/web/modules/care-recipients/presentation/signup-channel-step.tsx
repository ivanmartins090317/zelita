"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { Chip, Chips } from "@/components/ui/chips";
import { OptRow } from "@/components/ui/opt-row";
import { Tag } from "@/components/ui/tag";
import { signupContent } from "@/content/signup";
import type {
  SignupChannelSlug,
  SignupToneSlug,
} from "@/modules/care-recipients/domain/signup-options";
import { SignupMessagePreview } from "@/modules/care-recipients/presentation/signup-message-preview";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";
import type { SignupWizardData } from "@/modules/care-recipients/presentation/signup-types";

interface SignupChannelStepProps {
  data: Pick<
    SignupWizardData,
    | "channelPreference"
    | "tone"
    | "dontBotherBefore"
    | "dontBotherAfter"
    | "careDisplayName"
    | "managerName"
  >;
  dndError?: string;
  onChange: (
    patch: Partial<
      Pick<
        SignupWizardData,
        "channelPreference" | "tone" | "dontBotherBefore" | "dontBotherAfter"
      >
    >,
  ) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SignupChannelStep({
  data,
  dndError,
  onChange,
  onBack,
  onContinue,
}: SignupChannelStepProps) {
  const copy = signupContent.channel;

  return (
    <SignupStepShell onBack={onBack} onContinue={onContinue}>
      <SignupStepTitle title={copy.title} subtitle={copy.subtitle} />
      <div className="space-y-3">
        {copy.channels.map((channel) => (
          <button
            key={channel.slug}
            type="button"
            className="block w-full text-left"
            onClick={() =>
              onChange({
                channelPreference: channel.slug as SignupChannelSlug,
              })
            }
          >
            <OptRow
              selected={data.channelPreference === channel.slug}
              title={
                <>
                  {channel.title}
                  {channel.tag ? (
                    <Tag tone={channel.tag.tone} className="ml-2">
                      {channel.tag.label}
                    </Tag>
                  ) : null}
                </>
              }
              description={channel.description}
            />
          </button>
        ))}
      </div>

      <Field label={copy.toneLabel} className="mt-5">
        <Chips>
          {copy.tones.map((tone) => (
            <Chip
              key={tone.slug}
              selected={data.tone === tone.slug}
              onClick={() => onChange({ tone: tone.slug as SignupToneSlug })}
            >
              {tone.label}
            </Chip>
          ))}
        </Chips>
      </Field>

      <Field label={copy.previewLabel} className="mt-5">
        <SignupMessagePreview
          tone={data.tone}
          careDisplayName={data.careDisplayName}
          managerName={data.managerName}
        />
      </Field>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={copy.dndBeforeLabel} htmlFor="dnd-before">
          <Input
            id="dnd-before"
            type="time"
            value={data.dontBotherBefore}
            onChange={(event) =>
              onChange({ dontBotherBefore: event.target.value })
            }
          />
        </Field>
        <Field label={copy.dndAfterLabel} htmlFor="dnd-after">
          <Input
            id="dnd-after"
            type="time"
            value={data.dontBotherAfter}
            onChange={(event) =>
              onChange({ dontBotherAfter: event.target.value })
            }
          />
        </Field>
      </div>
      {dndError ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {dndError}
        </Note>
      ) : null}
    </SignupStepShell>
  );
}
