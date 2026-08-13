"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import type { AccountRole } from "@/modules/accounts/domain/roles";
import {
  updateNotificationPreferencesAction,
  type UpdateNotificationPreferencesResult,
} from "@/modules/alerts/application/update-notification-preferences";
import type {
  NotificationAlertType,
  NotificationChannel,
} from "@/modules/alerts/domain/alert-feed-types";
import {
  allowedChannelsForMember,
  toggleChannel,
} from "@/modules/alerts/domain/notification-channels";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NotificationMatrixEditModalProps {
  open: boolean;
  memberId: string;
  memberName: string;
  alertType: NotificationAlertType;
  role: AccountRole;
  initialChannels: NotificationChannel[];
  onClose: () => void;
}

interface EditFormProps {
  memberId: string;
  memberName: string;
  alertType: NotificationAlertType;
  role: AccountRole;
  initialChannels: NotificationChannel[];
  onClose: () => void;
}

function NotificationMatrixEditForm({
  memberId,
  memberName,
  alertType,
  role,
  initialChannels,
  onClose,
}: EditFormProps) {
  const copy = familyContent.avisos.matrix.modal;
  const [channels, setChannels] = useState(initialChannels);
  const allowed = allowedChannelsForMember(role, alertType);

  const [state, formAction, pending] = useActionState<
    UpdateNotificationPreferencesResult,
    FormData
  >(updateNotificationPreferencesAction, { ok: false });

  useEffect(() => {
    if (state.ok) {
      onClose();
    }
  }, [state.ok, onClose]);

  return (
    <>
      <p className="mb-4 text-secondary text-muted">
        {copy.hint
          .replace("{membro}", memberName)
          .replace("{tipo}", familyContent.avisos.matrix.rowLabels[alertType])}
      </p>

      <div className="flex flex-wrap gap-2">
        {allowed.map((channel) => {
          const selected = channels.includes(channel);
          return (
            <button
              key={channel}
              type="button"
              aria-pressed={selected}
              className={cn(
                "min-h-tap-chip rounded-pill border px-4 text-control font-semibold",
                selected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-line bg-white text-ink",
              )}
              onClick={() =>
                setChannels((current) =>
                  toggleChannel(current, channel, allowed),
                )
              }
            >
              {familyContent.avisos.matrix.channelLabels[channel]}
            </button>
          );
        })}
      </div>

      {state.message && !state.ok ? (
        <p className="mt-3 text-sm text-coral-dark">{state.message}</p>
      ) : null}

      <form action={formAction} className="mt-4 flex justify-end gap-2">
        <input type="hidden" name="memberId" value={memberId} />
        <input type="hidden" name="alertType" value={alertType} />
        <input type="hidden" name="channels" value={channels.join(",")} />
        <Button type="button" variant="secondary" onClick={onClose}>
          {copy.cancel}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? copy.saving : copy.save}
        </Button>
      </form>
    </>
  );
}

function NotificationMatrixEditModal({
  open,
  memberId,
  memberName,
  alertType,
  role,
  initialChannels,
  onClose,
}: NotificationMatrixEditModalProps) {
  const copy = familyContent.avisos.matrix.modal;

  return (
    <Modal open={open} onClose={onClose} title={copy.title}>
      {open ? (
        <NotificationMatrixEditForm
          key={`${memberId}-${alertType}`}
          memberId={memberId}
          memberName={memberName}
          alertType={alertType}
          role={role}
          initialChannels={initialChannels}
          onClose={onClose}
        />
      ) : null}
    </Modal>
  );
}

export { NotificationMatrixEditModal };
