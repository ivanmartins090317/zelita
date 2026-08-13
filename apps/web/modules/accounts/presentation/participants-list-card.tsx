"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import { resendInviteAction } from "@/modules/accounts/application/invite-actions";
import type { ParticipantListItem } from "@/modules/accounts/application/get-participantes-page";
import { cn } from "@/lib/utils";

interface ParticipantsListCardProps {
  participants: ParticipantListItem[];
  careRecipientDisplayName: string;
  canInvite: boolean;
  isPaused: boolean;
  onInviteClick: () => void;
  onResendSuccess: (acceptUrl: string, message: string) => void;
  onResendError: (message: string) => void;
}

function ParticipantAvatar({
  initials,
  highlighted,
}: {
  initials: string;
  highlighted: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-icon flex-none items-center justify-center rounded-full text-compact font-bold",
        highlighted
          ? "bg-brand-700 text-white"
          : "bg-sand-2 text-muted",
      )}
    >
      {initials}
    </span>
  );
}

function ParticipantsListCard({
  participants,
  careRecipientDisplayName,
  canInvite,
  isPaused,
  onInviteClick,
  onResendSuccess,
  onResendError,
}: ParticipantsListCardProps) {
  const copy = familyContent.participantes;
  const [isPending, startTransition] = useTransition();

  const title = copy.listCard.titleTemplate.replace(
    "{apelido}",
    careRecipientDisplayName,
  );

  function handleResend(inviteId: string) {
    const formData = new FormData();
    formData.set("inviteId", inviteId);
    startTransition(async () => {
      const result = await resendInviteAction({ ok: false }, formData);
      if (result.ok && result.acceptUrl) {
        onResendSuccess(result.acceptUrl, result.message ?? copy.feedback.inviteResent);
        return;
      }
      onResendError(result.message ?? copy.feedback.resendError);
    });
  }

  return (
    <Card>
      <CardHeader className="justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        {canInvite ? (
          <Button
            type="button"
            size="xs"
            disabled={isPaused || isPending}
            onClick={onInviteClick}
          >
            {copy.listCard.inviteButton}
          </Button>
        ) : null}
      </CardHeader>
      <CardBody className="p-0">
        {participants.map((participant) => (
          <ListRow
            key={`${participant.kind}-${participant.id}`}
            icon={
              <ParticipantAvatar
                initials={participant.initials}
                highlighted={participant.isSelf}
              />
            }
            title={participant.title}
            subtitle={
              <>
                {participant.subtitle}
                {participant.emergencyNote ? (
                  <span className="mt-1 block text-compact text-muted">
                    {participant.emergencyNote}
                  </span>
                ) : null}
              </>
            }
            trailing={
              <>
                <Tag tone="info">{participant.roleLabel}</Tag>
                <Tag tone={participant.situationTone}>
                  {participant.situationLabel}
                </Tag>
                {participant.canResend && participant.inviteId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    disabled={isPaused || isPending}
                    onClick={() => handleResend(participant.inviteId!)}
                  >
                    {copy.listCard.resendButton}
                  </Button>
                ) : null}
              </>
            }
          />
        ))}
      </CardBody>
      {!canInvite ? (
        <CardBody className="border-t border-line-2 pt-0">
          <Note tone="info" icon="ℹ️" className="mt-4">
            {copy.viewerHint}
          </Note>
        </CardBody>
      ) : null}
      {canInvite && isPaused ? (
        <CardBody className="border-t border-line-2 pt-0">
          <Note tone="warning" icon="⏸" className="mt-4">
            {copy.pausedHint}
          </Note>
        </CardBody>
      ) : null}
    </Card>
  );
}

export { ParticipantsListCard };
