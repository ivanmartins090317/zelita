"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { elderContent, elderRoutes } from "@/content/elder";
import type { ElderHomeCard } from "@/modules/elder-access/domain/elder-schedule";
import { elderSosPersistsAlert } from "@/modules/elder-access/domain/elder-schedule";
import {
  elderSosClass,
  elderTapClass,
  elderTitleClass,
} from "@/modules/elder-access/presentation/elder-classes";
import { SAMU_TEL } from "@/modules/elder-access/domain/elder-call";

interface ElderHomeProps {
  greeting: string;
  dateLabel: string;
  homeCard: ElderHomeCard;
  loadWarning: string | null;
}

export function ElderHome({
  greeting,
  dateLabel,
  homeCard,
  loadWarning,
}: ElderHomeProps) {
  const [sent, setSent] = useState(false);
  if (sent) return <ElderSosSent onBack={() => setSent(false)} />;

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
      <ElderHelpButton onConfirm={() => setSent(true)} />
      <p className="my-3 text-center text-[length:var(--elder-body)] text-muted">
        {elderContent.home.helpHint}
      </p>
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

function ElderHelpButton({ onConfirm }: { onConfirm: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

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
          {elderContent.sos.confirmBody}
        </p>
        <button
          type="button"
          className={`${elderSosClass} mt-5`}
          onClick={() => {
            if (elderSosPersistsAlert()) return;
            dialogRef.current?.close();
            onConfirm();
          }}
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

function ElderSosSent({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <p className="flex size-16 items-center justify-center rounded-pill bg-ok-bg text-[28px] text-ok" aria-hidden>
        ✓
      </p>
      <h1 className={`${elderTitleClass} mt-4`}>{elderContent.sos.sentTitle}</h1>
      <p className="mt-4 rounded-note border border-coral-line bg-coral-bg p-4 text-left text-[length:var(--elder-body)] text-on-coral">
        <strong>{elderContent.sos.sentSerious}</strong>
      </p>
      <a href={SAMU_TEL} className={`${elderSosClass} mt-4`}>
        <span aria-hidden>📞</span>
        {elderContent.sos.callSamu}
      </a>
      <button type="button" className={`${elderTapClass} mt-3 justify-center`} onClick={onBack}>
        {elderContent.sos.backHome}
      </button>
    </div>
  );
}
