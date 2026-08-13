"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Note } from "@/components/ui/note";
import { familyContent, familyRoutes } from "@/content/family";
import type { InviteActionResult } from "@/modules/accounts/application/invite-actions";
import type { ParticipantesPageViewModel } from "@/modules/accounts/application/get-participantes-page";
import { InviteModal } from "@/modules/accounts/presentation/invite-modal";
import { ParticipantsListCard } from "@/modules/accounts/presentation/participants-list-card";
import { PermissionMatrixCard } from "@/modules/accounts/presentation/permission-matrix-card";

interface ParticipantesPageViewProps {
  data: ParticipantesPageViewModel;
}

function FeedbackBanner({
  message,
  acceptUrl,
  onDismiss,
}: {
  message: string;
  acceptUrl?: string;
  onDismiss: () => void;
}) {
  const copy = familyContent.participantes.feedback;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!acceptUrl) return;
    try {
      await navigator.clipboard.writeText(
        acceptUrl.startsWith("http")
          ? acceptUrl
          : `${window.location.origin}${acceptUrl}`,
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Note icon="✓" tone="info" className="mb-5">
      <p>{message}</p>
      <p className="mt-1 text-compact">{copy.validityNote}</p>
      {!acceptUrl ? null : (
        <>
          <p className="mt-2 text-compact">{copy.manualShareNote}</p>
          <button
            type="button"
            className="mt-3 font-bold text-brand-700 underline"
            onClick={handleCopy}
          >
            {copied ? copy.copied : copy.copyLink}
          </button>
        </>
      )}
      <button
        type="button"
        className="mt-3 block text-compact text-muted underline"
        onClick={onDismiss}
      >
        Fechar
      </button>
    </Note>
  );
}

function ParticipantesPageView({ data }: ParticipantesPageViewProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    message: string;
    acceptUrl?: string;
  } | null>(null);

  const closeModal = useCallback(() => {
    router.replace(familyRoutes.participantes);
  }, [router]);

  const openModal = useCallback(() => {
    router.push(`${familyRoutes.participantes}?modal=convite`);
  }, [router]);

  const handleInviteSuccess = useCallback((result: InviteActionResult) => {
    setFeedback({
      message: result.message ?? "",
      acceptUrl: result.acceptUrl,
    });
  }, []);

  return (
    <>
      {feedback ? (
        <FeedbackBanner
          message={feedback.message}
          acceptUrl={feedback.acceptUrl}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <ParticipantsListCard
        participants={data.participants}
        careRecipientDisplayName={data.careRecipientDisplayName}
        canInvite={data.canInvite}
        isPaused={data.isPaused}
        onInviteClick={openModal}
        onResendSuccess={(acceptUrl, message) =>
          setFeedback({ message, acceptUrl })
        }
        onResendError={(message) => setFeedback({ message })}
      />

      <PermissionMatrixCard />

      {data.canInvite ? (
        <InviteModal
          open={data.openModal}
          onClose={closeModal}
          onSuccess={handleInviteSuccess}
        />
      ) : null}
    </>
  );
}

export { ParticipantesPageView };
