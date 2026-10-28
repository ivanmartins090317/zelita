"use client";

import { useState } from "react";

import { elderContent } from "@/content/elder";
import { confirmElderDeviceAction } from "@/modules/elder-access/application/device-link-actions";
import {
  elderTapClass,
  elderTitleClass,
} from "@/modules/elder-access/presentation/elder-classes";

interface ActivateDeviceScreenProps {
  token: string;
}

export function ActivateDeviceScreen({ token }: ActivateDeviceScreenProps) {
  const copy = elderContent.activate;
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center bg-sand px-6 py-16 text-ink">
        <p className="text-[17px] font-bold text-brand-700">{elderContent.brand}</p>
        <h1 className={`${elderTitleClass} mt-3`}>{copy.later}</h1>
        <p className="mt-4 text-[17px] leading-snug text-muted">{copy.laterBody}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center bg-sand px-6 py-16 text-ink">
      <p className="text-[17px] font-bold text-brand-700">{elderContent.brand}</p>
      <h1 className={`${elderTitleClass} mt-3`}>{copy.title}</h1>
      <p className="mt-4 text-[17px] leading-snug text-muted">{copy.body}</p>
      <form action={confirmElderDeviceAction} className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="token" value={token} />
        <button type="submit" className={`${elderTapClass} justify-center bg-brand-700 text-white`}>
          {copy.confirm}
        </button>
        <button
          type="button"
          className={`${elderTapClass} justify-center`}
          onClick={() => setDeclined(true)}
        >
          {copy.later}
        </button>
      </form>
    </main>
  );
}

export function DeviceLinkClosedScreen() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center bg-sand px-6 py-16 text-ink">
      <p className="text-[17px] font-bold text-brand-700">{elderContent.brand}</p>
      <h1 className={`${elderTitleClass} mt-3`}>{elderContent.linkDead.title}</h1>
      <p className="mt-4 text-[17px] leading-snug text-muted">{elderContent.linkDead.body}</p>
    </main>
  );
}
