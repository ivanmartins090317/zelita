"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { elderContent, elderRoutes } from "@/content/elder";
import { elderHelpClaimsFamilyNotified } from "@/modules/elder-access/domain/device-link";
import type { ElderHomeCard } from "@/modules/elder-access/domain/elder-schedule";
import { elderSosPersistsAlert } from "@/modules/elder-access/domain/elder-schedule";
import {
  ELDER_GPS_WAIT_MS,
  ElderSosError,
  ElderSosSent,
  readElderGrantedPosition,
} from "@/modules/elder-access/presentation/elder-confirm-home";
import {
  elderSosClass,
  elderTapClass,
  elderTitleClass,
} from "@/modules/elder-access/presentation/elder-classes";
import {
  recordForegroundPositionAction,
  shouldReadForegroundPositionAction,
} from "@/modules/location/application/record-foreground-position";
import {
  attachElderSosPositionAction,
  triggerElderSosAction,
} from "@/modules/sos/application/trigger-elder-sos";

interface ElderHomeProps {
  greeting: string;
  dateLabel: string;
  homeCard: ElderHomeCard;
  loadWarning: string | null;
  linkedDevice: boolean;
  familyTel: string | null;
}

export function ElderHome({
  greeting,
  dateLabel,
  homeCard,
  loadWarning,
  linkedDevice,
  familyTel,
}: ElderHomeProps) {
  const [screen, setScreen] = useState<"home" | "sent" | "error">("home");

  useEffect(() => {
    if (!linkedDevice) return;
    let cancelled = false;
    void (async () => {
      try {
        const gate = await shouldReadForegroundPositionAction();
        if (!gate.ok || cancelled) return;
        const fix = await readElderGrantedPosition(ELDER_GPS_WAIT_MS);
        if (!fix || cancelled) return;
        await recordForegroundPositionAction(fix);
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.error("[elder-home] foreground_position_failed");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkedDevice]);

  if (screen === "sent") {
    return (
      <ElderSosSent
        claimsNotified={elderHelpClaimsFamilyNotified(
          linkedDevice ? "device" : "preview",
        )}
        familyTel={familyTel}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "error") {
    return <ElderSosError onBack={() => setScreen("home")} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[length:var(--elder-body)] font-bold text-brand-700">
          {elderContent.brand}
        </p>
        <Link
          href={elderRoutes.settings}
          className="elder-surface inline-flex min-h-tap-elder items-center rounded-elder border-2 border-line bg-white px-4 font-bold text-brand-800"
          aria-label={elderContent.letters}
        >
          {elderContent.letters}
        </Link>
      </div>
      <h1 className={elderTitleClass}>{greeting}</h1>
      <p className="mt-2 text-[length:var(--elder-body)] text-muted">{dateLabel}</p>
      <ElderMedicineCard card={homeCard} loadWarning={loadWarning} />
      <ElderHelpButton
        linkedDevice={linkedDevice}
        onSent={() => setScreen("sent")}
        onError={() => setScreen("error")}
      />
      <p className="my-3 text-center text-[length:var(--elder-body)] text-muted">
        {linkedDevice ? elderContent.home.helpHintLinked : elderContent.home.helpHint}
      </p>
      {linkedDevice ? (
        <Link href={elderRoutes.casa} className={`${elderTapClass} mb-3`}>
          <span aria-hidden>🏠</span>
          {elderContent.home.atHome}
        </Link>
      ) : null}
      <Link href={elderRoutes.family} className={`${elderTapClass} mb-3`}>
        <span aria-hidden>📞</span>
        {elderContent.home.callFamily}
      </Link>
      <Link href={elderRoutes.schedule} className={elderTapClass}>
        <span aria-hidden>🕐</span>
        {elderContent.home.today}
      </Link>
    </div>
  );
}

function ElderMedicineCard({
  card,
  loadWarning,
}: {
  card: ElderHomeCard;
  loadWarning: string | null;
}) {
  const message = loadWarning
    ? loadWarning
    : card.kind === "finished"
      ? elderContent.home.finished
      : card.kind === "empty"
        ? elderContent.home.empty
        : null;

  if (message || card.kind !== "next") {
    return (
      <section className="elder-surface mt-5 rounded-card border-2 border-brand-200 bg-brand-50 p-4">
        <p className="text-[length:var(--elder-body)] font-bold">{message}</p>
      </section>
    );
  }

  return (
    <section className="elder-surface mt-5 rounded-card border-2 border-brand-200 bg-brand-50 p-4">
      <p className="text-[length:var(--elder-body)] font-bold tracking-wide text-brand-700 uppercase">
        {elderContent.home.nextKicker}
      </p>
      <h2 className={`${elderTitleClass} mt-2`}>
        {card.medicationName} {card.dosageLabel}
      </h2>
      <p className={`${elderTitleClass} mt-2`}>{card.timeLabel}</p>
    </section>
  );
}

function ElderHelpButton({
  linkedDevice,
  onSent,
  onError,
}: {
  linkedDevice: boolean;
  onSent: () => void;
  onError: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);

  async function confirmHelp() {
    if (busy) return;
    setBusy(true);
    dialogRef.current?.close();
    if (!elderSosPersistsAlert(linkedDevice)) {
      setBusy(false);
      onSent();
      return;
    }
    try {
      const started = await triggerElderSosAction();
      if (!started.ok) {
        setBusy(false);
        onError();
        return;
      }
      if (started.outcome === "created" && started.tryPosition) {
        const fix = await readElderGrantedPosition(ELDER_GPS_WAIT_MS);
        if (fix) {
          try {
            await attachElderSosPositionAction(fix);
          } catch {
            if (process.env.NODE_ENV === "development") {
              console.error("[elder-sos] position_attach_failed");
            }
          }
        }
      }
      setBusy(false);
      onSent();
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.error("[elder-sos] trigger_failed");
      }
      setBusy(false);
      onError();
    }
  }

  return (
    <>
      <button
        type="button"
        className={`${elderSosClass} mt-5`}
        onClick={() => dialogRef.current?.showModal()}
      >
        <span aria-hidden>🆘</span>
        {elderContent.home.help}
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(100%-1.5rem,32rem)] rounded-sheet border-0 bg-sand p-5 text-ink backdrop:bg-ink/40"
        aria-labelledby="elder-help-title"
      >
        <h2 id="elder-help-title" className={`${elderTitleClass} text-center`}>
          {elderContent.sos.confirmTitle}
        </h2>
        <p className="mt-3 text-center text-[length:var(--elder-body)] text-muted">
          {linkedDevice
            ? elderContent.sos.linkedConfirmBody
            : elderContent.sos.confirmBody}
        </p>
        <button
          type="button"
          className={`${elderSosClass} mt-5`}
          disabled={busy}
          onClick={() => void confirmHelp()}
        >
          {elderContent.sos.confirm}
        </button>
        <button
          type="button"
          className={`${elderTapClass} mt-3 justify-center`}
          onClick={() => dialogRef.current?.close()}
        >
          {elderContent.sos.cancel}
        </button>
      </dialog>
    </>
  );
}

