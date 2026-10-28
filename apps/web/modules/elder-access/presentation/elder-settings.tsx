"use client";

import { useState } from "react";

import { elderContent } from "@/content/elder";
import { saveElderDisplayAction } from "@/modules/elder-access/application/save-elder-display";
import {
  ELDER_TEXT_STEP_IDS,
  elderTextMetrics,
  type ElderContrast,
  type ElderCue,
  type ElderDisplayPreferences,
  type ElderTextStepId,
} from "@/modules/elder-access/domain/elder-display";
import { elderTapClass } from "@/modules/elder-access/presentation/elder-classes";
import { ElderScreenTitle } from "@/modules/elder-access/presentation/elder-shell";
import { cn } from "@/lib/utils";

interface ElderSettingsProps {
  initial: ElderDisplayPreferences;
}

const SAMPLE_SIZE: Record<ElderTextStepId, string> = {
  pequeno: "17px",
  medio: "22px",
  grande: "28px",
};

export function ElderSettings({ initial }: ElderSettingsProps) {
  const [prefs, setPrefs] = useState(initial);
  const [note, setNote] = useState<string | null>(null);

  async function commit(next: ElderDisplayPreferences, cueNote: string | null) {
    setPrefs(next);
    applyDisplay(next);
    const result = await saveElderDisplayAction(next);
    if (!result.ok) {
      setPrefs(prefs);
      applyDisplay(prefs);
      setNote(result.message ?? elderContent.settings.saveError);
      return;
    }
    setNote(cueNote ?? elderContent.settings.saved);
  }

  return (
    <div>
      <ElderScreenTitle title={elderContent.settings.title} lead={elderContent.settings.lead} />
      <h2 className="mb-3 text-[length:var(--elder-body)] font-bold">
        {elderContent.settings.textLabel}
      </h2>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {ELDER_TEXT_STEP_IDS.map((step) => (
          <button
            key={step}
            type="button"
            aria-pressed={prefs.text === step}
            className={cn(
              elderTapClass,
              "justify-center px-2",
              prefs.text === step && "border-brand-600 bg-brand-50",
            )}
            onClick={() => {
              void commit({ ...prefs, text: step }, null);
            }}
          >
            <span className="flex flex-col items-center gap-1">
              <span style={{ fontSize: SAMPLE_SIZE[step] }}>A</span>
              <span className="text-[length:var(--elder-body)]">{elderContent.settings.textOptions[step]}</span>
            </span>
          </button>
        ))}
      </div>

      <h2 className="mb-3 text-[length:var(--elder-body)] font-bold">
        {elderContent.settings.colorLabel}
      </h2>
      <ChoiceButton
        pressed={prefs.contrast === "normal"}
        label={elderContent.settings.contrastNormal}
        swatchClass="border-brand-200 bg-brand-50"
        onClick={() => {
          void commit({ ...prefs, contrast: "normal" }, null);
        }}
      />
      <ChoiceButton
        pressed={prefs.contrast === "forte"}
        label={elderContent.settings.contrastStrong}
        swatchClass="border-ink bg-ink"
        onClick={() => {
          void commit({ ...prefs, contrast: "forte" satisfies ElderContrast }, null);
        }}
      />

      <h2 className="mt-4 mb-3 text-[length:var(--elder-body)] font-bold">
        {elderContent.settings.cueLabel}
      </h2>
      <ChoiceButton
        pressed={prefs.cue === "som"}
        label={elderContent.settings.sound}
        emoji="🔊"
        onClick={() => {
          const played = playSoundSample();
          void commit(
            { ...prefs, cue: "som" satisfies ElderCue },
            played ? null : elderContent.settings.noSound,
          );
        }}
      />
      <ChoiceButton
        pressed={prefs.cue === "vibrar"}
        label={elderContent.settings.vibrate}
        emoji="📳"
        onClick={() => {
          const played = playVibrateSample();
          void commit(
            { ...prefs, cue: "vibrar" },
            played ? null : elderContent.settings.noVibrate,
          );
        }}
      />
      {note ? (
        <p className="mt-2 text-[length:var(--elder-body)] text-ink" role="status">
          {note}
        </p>
      ) : null}
      <p className="elder-surface mt-5 rounded-note bg-sand-2 p-4 text-center text-[length:var(--elder-body)] text-muted">
        {elderContent.settings.whatsappNote} {elderContent.settings.familyNote}
      </p>
    </div>
  );
}

function ChoiceButton({
  pressed,
  label,
  onClick,
  emoji,
  swatchClass,
}: {
  pressed: boolean;
  label: string;
  onClick: () => void;
  emoji?: string;
  swatchClass?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(elderTapClass, "mb-3", pressed && "border-brand-600 bg-brand-50")}
      onClick={onClick}
    >
      {emoji ? <span aria-hidden>{emoji}</span> : null}
      {swatchClass ? (
        <span aria-hidden className={cn("size-8 rounded-control border-2", swatchClass)} />
      ) : null}
      {label}
    </button>
  );
}

function applyDisplay(prefs: ElderDisplayPreferences) {
  const root = document.getElementById("elder-app");
  if (!root) return;
  const metrics = elderTextMetrics(prefs.text);
  root.style.setProperty("--elder-body", `${metrics.bodyPx}px`);
  root.style.setProperty("--elder-title", `${metrics.titlePx}px`);
  root.dataset.contrast = prefs.contrast;
}

function playSoundSample(): boolean {
  const AudioContextCtor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return false;
  const context = new AudioContextCtor();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.18);
  oscillator.onended = () => {
    void context.close();
  };
  return true;
}

function playVibrateSample(): boolean {
  if (typeof navigator.vibrate !== "function") return false;
  return navigator.vibrate(200);
}
