"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { OptRow } from "@/components/ui/opt-row";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import type { AjustesChannelViewModel } from "@/modules/care-recipients/application/ajustes-view-models";
import { updateCareSettingsAction } from "@/modules/care-recipients/application/update-care-settings";
import type { SignupChannelSlug } from "@/modules/care-recipients/domain/signup-options";
import {
  WA_OPT_IN_STATUS,
  VOICE_CHANNEL_STATUS,
} from "@/modules/care-recipients/domain/care-settings-labels";

interface AjustesChannelsCardProps {
  channels: AjustesChannelViewModel;
  canEdit: boolean;
  isPaused: boolean;
  tone: string;
  dontBotherBefore: string;
  dontBotherAfter: string;
}

function AjustesChannelsCard({
  channels,
  canEdit,
  isPaused,
  tone,
  dontBotherBefore,
  dontBotherAfter,
}: AjustesChannelsCardProps) {
  const copy = familyContent.ajustes.channels;
  const [selectedChannel, setSelectedChannel] = useState(channels.channelPreference);
  const [state, formAction, pending] = useActionState(updateCareSettingsAction, {
    ok: false,
  });

  const waTag =
    channels.waOptInStatus === WA_OPT_IN_STATUS.active
      ? copy.tags.active
      : copy.tags.pending;
  const waTone =
    channels.waOptInStatus === WA_OPT_IN_STATUS.active ? "ok" : "warning";

  const voiceTag =
    channels.voiceStatus === VOICE_CHANNEL_STATUS.active
      ? copy.tags.active
      : copy.tags.inactive;
  const voiceTone =
    channels.voiceStatus === VOICE_CHANNEL_STATUS.active ? "ok" : "muted";

  const disabled = !canEdit || isPaused;

  return (
    <Card>
      <CardHeader>
        <span aria-hidden>{copy.cardIcon}</span>
        <CardTitle>{copy.cardTitle}</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        <ListRow
          icon="📱"
          title={copy.whatsappTitle}
          subtitle={copy.whatsappSubtitle}
          trailing={<Tag tone={waTone}>{waTag}</Tag>}
        />
        {channels.showVoiceLine ? (
          <ListRow
            icon="📞"
            title={copy.voiceTitle}
            subtitle={copy.voiceSubtitle}
            trailing={<Tag tone={voiceTone}>{voiceTag}</Tag>}
          />
        ) : null}
        <ListRow
          icon="📲"
          title={copy.shortcutTitle}
          subtitle={copy.shortcutSubtitle}
          trailing={
            <div className="flex items-center gap-2">
              <Tag tone="muted">{copy.tags.notLinked}</Tag>
              <Button variant="secondary" size="xs" asChild>
                <a href={familyRoutes.guia}>{copy.howItWorks}</a>
              </Button>
            </div>
          }
        />
        <ListRow
          icon="🎥"
          title={copy.videoTitle}
          subtitle={copy.tags.unavailable}
          className="opacity-60"
          trailing={<Tag tone="muted">{copy.tags.unavailable}</Tag>}
        />
      </CardBody>

      {canEdit ? (
        <CardBody className="space-y-3 border-t border-line-2">
          {channels.waOptInStatus === WA_OPT_IN_STATUS.pending ? (
            <Note tone="info" icon="ℹ️">
              {familyContent.ajustes.channels.optInPendingNote}
            </Note>
          ) : null}
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="tone" value={tone} />
            <input type="hidden" name="dontBotherBefore" value={dontBotherBefore} />
            <input type="hidden" name="dontBotherAfter" value={dontBotherAfter} />
            <input type="hidden" name="channelPreference" value={selectedChannel} />
            {channels.channelOptions.map((option) => (
              <button
                key={option.slug}
                type="button"
                className="block w-full text-left"
                disabled={disabled || pending}
                onClick={() => setSelectedChannel(option.slug as SignupChannelSlug)}
              >
                <OptRow
                  selected={selectedChannel === option.slug}
                  title={option.title}
                  description={option.description}
                />
              </button>
            ))}
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
        </CardBody>
      ) : null}
    </Card>
  );
}

export { AjustesChannelsCard };
