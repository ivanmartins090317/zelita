"use client";

import Link from "next/link";
import { useState } from "react";

import { elderContent, elderRoutes } from "@/content/elder";
import { SAMU_TEL } from "@/modules/elder-access/domain/elder-call";
import { confirmHomeFromDeviceAction } from "@/modules/location/application/confirm-home-from-device";
import {
  elderSosClass,
  elderTapClass,
  elderTitleClass,
} from "@/modules/elder-access/presentation/elder-classes";

export const ELDER_GPS_WAIT_MS = 8_000;

export interface ElderFix {
  lat: number;
  lng: number;
  accuracyM: number | null;
}

function readCurrentPosition(timeoutMs: number): Promise<ElderFix | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          resolve(null);
          return;
        }
        const accuracy = position.coords.accuracy;
        resolve({
          lat,
          lng,
          accuracyM: Number.isFinite(accuracy) ? accuracy : null,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

async function geoPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }
  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state === "granted" || status.state === "denied" || status.state === "prompt") {
      return status.state;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

/** Só lê se o navegador já autorizou. Não abre um pedido novo de permissão. */
export async function readElderGrantedPosition(
  timeoutMs: number,
): Promise<ElderFix | null> {
  const permission = await geoPermission();
  if (permission !== "granted") return null;
  return readCurrentPosition(timeoutMs);
}

export function ElderSosError({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <h1 className={`${elderTitleClass} mt-4`}>{elderContent.sos.persistError}</h1>
      <a href={SAMU_TEL} className={`${elderSosClass} mt-5`}>
        <span aria-hidden>📞</span>
        {elderContent.sos.callSamu}
      </a>
      <button type="button" className={`${elderTapClass} mt-3 justify-center`} onClick={onBack}>
        {elderContent.sos.backHome}
      </button>
    </div>
  );
}

export function ElderSosSent({
  claimsNotified,
  familyTel,
  onBack,
}: {
  claimsNotified: boolean;
  familyTel: string | null;
  onBack: () => void;
}) {
  if (claimsNotified) {
    return (
      <div className="flex flex-1 flex-col items-center text-center">
        <h1 className={`${elderTitleClass} mt-4`}>{elderContent.sos.linkedSentTitle}</h1>
        <p className="mt-4 text-[length:var(--elder-body)] text-muted">
          {elderContent.sos.linkedSentBody}
        </p>
        {familyTel ? (
          <a href={familyTel} className={`${elderTapClass} mt-5 justify-center`}>
            <span aria-hidden>📞</span>
            {elderContent.sos.callFamily}
          </a>
        ) : (
          <Link href={elderRoutes.family} className={`${elderTapClass} mt-5 justify-center`}>
            <span aria-hidden>📞</span>
            {elderContent.sos.callFamily}
          </Link>
        )}
        <a href={SAMU_TEL} className={`${elderSosClass} mt-3`}>
          <span aria-hidden>📞</span>
          {elderContent.sos.callSamu}
        </a>
        <button type="button" className={`${elderTapClass} mt-3 justify-center`} onClick={onBack}>
          {elderContent.sos.backHome}
        </button>
      </div>
    );
  }

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

export function ElderConfirmHome() {
  const [phase, setPhase] = useState<"ask" | "wait" | "saved" | "denied">("ask");

  async function confirm() {
    if (phase === "wait") return;
    setPhase("wait");
    const fix = await readCurrentPosition(ELDER_GPS_WAIT_MS);
    if (!fix) {
      setPhase("denied");
      return;
    }
    try {
      const result = await confirmHomeFromDeviceAction(fix);
      setPhase(result.ok ? "saved" : "denied");
    } catch {
      setPhase("denied");
    }
  }

  if (phase === "saved") {
    return (
      <div className="flex flex-1 flex-col">
        <h1 className={elderTitleClass}>{elderContent.casa.savedTitle}</h1>
        <p className="mt-4 text-[length:var(--elder-body)] text-muted">
          {elderContent.casa.savedBody}
        </p>
        <Link href={elderRoutes.home} className={`${elderTapClass} mt-5 justify-center`}>
          {elderContent.casa.backHome}
        </Link>
      </div>
    );
  }

  if (phase === "denied") {
    return (
      <div className="flex flex-1 flex-col">
        <h1 className={elderTitleClass}>{elderContent.casa.title}</h1>
        <p className="mt-4 text-[length:var(--elder-body)]">{elderContent.casa.denied}</p>
        <button type="button" className={`${elderTapClass} mt-5 justify-center`} onClick={() => setPhase("ask")}>
          {elderContent.casa.confirm}
        </button>
        <Link href={elderRoutes.home} className={`${elderTapClass} mt-3 justify-center`}>
          {elderContent.casa.cancel}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <h1 className={elderTitleClass}>{elderContent.casa.title}</h1>
      <p className="mt-4 text-[length:var(--elder-body)] text-muted">{elderContent.casa.lead}</p>
      <button
        type="button"
        className={`${elderTapClass} mt-5 justify-center`}
        disabled={phase === "wait"}
        onClick={() => void confirm()}
      >
        {phase === "wait" ? elderContent.casa.wait : elderContent.casa.confirm}
      </button>
      <Link href={elderRoutes.home} className={`${elderTapClass} mt-3 justify-center`}>
        {elderContent.casa.cancel}
      </Link>
    </div>
  );
}
