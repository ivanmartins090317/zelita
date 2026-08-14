"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip, Chips } from "@/components/ui/chips";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import type { AjustesToneViewModel } from "@/modules/care-recipients/application/ajustes-view-models";
import { updateCareSettingsAction } from "@/modules/care-recipients/application/update-care-settings";
import { buildReminderPreviewWithMedication } from "@/modules/care-recipients/domain/message-preview-with-medication";
import type { SignupChannelSlug, SignupToneSlug } from "@/modules/care-recipients/domain/signup-options";

interface AjustesToneCardProps {
  tone: AjustesToneViewModel;
  channelPreference: SignupChannelSlug;
  careDisplayName: string;
  managerName: string;
  canEdit: boolean;
  isPaused: boolean;
}

function AjustesToneCard({
  tone: initialTone,
  channelPreference,
  careDisplayName,
  managerName,
  canEdit,
  isPaused,
}: AjustesToneCardProps) {
  const copy = familyContent.ajustes.tone;
  const [tone, setTone] = useState<SignupToneSlug>(initialTone.tone);
  const [dontBotherBefore, setDontBotherBefore] = useState(
    initialTone.dontBotherBefore,
  );
  const [dontBotherAfter, setDontBotherAfter] = useState(
    initialTone.dontBotherAfter,
  );
  const [state, formAction, pending] = useActionState(updateCareSettingsAction, {
    ok: false,
  });

  const previewText = useMemo(
    () =>
      buildReminderPreviewWithMedication({
        tone,
        careDisplayName,
        managerName,
        medication: initialTone.medicationSample,
      }),
    [tone, careDisplayName, managerName, initialTone.medicationSample],
  );

  const previewTitle = initialTone.previewTime
    ? copy.previewTitleTemplate.replace("{hora}", initialTone.previewTime)
    : copy.previewTitleTemplate.replace("{hora}", "—");

  const disabled = !canEdit || isPaused;

  return (
    <Card id="tom-e-horarios" className="scroll-mt-24">
      <CardHeader>
        <span aria-hidden>{copy.cardIcon}</span>
        <CardTitle>{copy.cardTitle}</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <Field label={copy.toneLabel}>
          <Chips>
            {initialTone.toneOptions.map((option) => (
              <Chip
                key={option.slug}
                selected={tone === option.slug}
                disabled={disabled}
                onClick={() => setTone(option.slug)}
              >
                {option.label}
              </Chip>
            ))}
          </Chips>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={copy.dndBeforeLabel} htmlFor="ajustes-dnd-before">
            <Input
              id="ajustes-dnd-before"
              type="time"
              value={dontBotherBefore}
              disabled={disabled}
              onChange={(event) => setDontBotherBefore(event.target.value)}
            />
          </Field>
          <Field label={copy.dndAfterLabel} htmlFor="ajustes-dnd-after">
            <Input
              id="ajustes-dnd-after"
              type="time"
              value={dontBotherAfter}
              disabled={disabled}
              onChange={(event) => setDontBotherAfter(event.target.value)}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-secondary font-semibold text-muted">
            {previewTitle}
          </p>
          <div className="rounded-note bg-[#DCF8C6] px-4 py-3 text-[15px] leading-relaxed text-ink">
            {previewText}
          </div>
          {!initialTone.previewHasMedication ? (
            <p className="mt-2 text-secondary text-muted">{copy.previewEmptyHint}</p>
          ) : null}
        </div>

        <Note tone="warning" icon="⚠️">
          {copy.toneNote}
        </Note>

        {canEdit ? (
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="tone" value={tone} />
            <input type="hidden" name="channelPreference" value={channelPreference} />
            <input type="hidden" name="dontBotherBefore" value={dontBotherBefore} />
            <input type="hidden" name="dontBotherAfter" value={dontBotherAfter} />
            <Button type="submit" size="sm" disabled={disabled || pending}>
              {copy.saveButton}
            </Button>
            {state.message ? (
              <p
                className={
                  state.ok ? "text-secondary text-ok" : "text-secondary text-coral-dark"
                }
              >
                {state.message}
              </p>
            ) : null}
          </form>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { AjustesToneCard };
