"use client";

import { useEffect, useState } from "react";

import { startFamilyGuideTour } from "@/components/family-guide/family-guide-tour";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";

interface WelcomeModalProps {
  accountId: string;
  profileName: string | null;
  trialDays: number;
  enabled: boolean;
}

function readDismissed(storageKey: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(storageKey) === "1";
}

function persistDismissed(storageKey: string): void {
  window.localStorage.setItem(storageKey, "1");
}

function WelcomeModal({
  accountId,
  profileName,
  trialDays,
  enabled,
}: WelcomeModalProps) {
  const copy = familyContent.hoje.welcomeModal;
  const storageKey = `${copy.storageKeyPrefix}${accountId}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled || readDismissed(storageKey)) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [enabled, storageKey]);

  function dismiss() {
    persistDismissed(storageKey);
    setOpen(false);
  }

  function beginGuide() {
    dismiss();
    window.setTimeout(() => {
      startFamilyGuideTour();
    }, 150);
  }

  const title = profileName
    ? copy.titleNamed.replace("{nome}", profileName)
    : copy.titleNeutral;

  return (
    <Modal
      open={open}
      onClose={dismiss}
      title={title}
      footer={
        <div className="space-y-2.5">
          <Button className="w-full" onClick={beginGuide}>
            {copy.primary}
          </Button>
          <Button variant="secondary" className="w-full" onClick={dismiss}>
            {copy.secondary}
          </Button>
          <p className="pt-1 text-center text-compact text-muted">
            {copy.footer}
          </p>
        </div>
      }
    >
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-[74px] items-center justify-center rounded-full bg-brand-50">
          <svg width={40} height={40} viewBox="0 0 48 48" aria-hidden="true">
            <path
              d="M 38.11 24.64 A 14.8 14.8 0 1 1 14.23 15.46 A 12.8 12.8 0 0 0 38.11 24.64 Z"
              fill="#12766E"
            />
            <circle cx="26.5" cy="16" r="5.6" fill="#12766E" />
          </svg>
        </div>
        <p className="text-body text-muted">
          {copy.body.replace("{dias}", String(trialDays))}
        </p>
        <p className="text-secondary text-muted">{copy.tourNote}</p>
      </div>
    </Modal>
  );
}

export { WelcomeModal };
