import { z } from "zod";

export const ELDER_BODY_FLOOR_PX = 17;
export const ELDER_TITLE_MIN_PX = 23;
export const ELDER_TITLE_MAX_PX = 26;
export const ELDER_TAP_MIN_PX = 56;
export const ELDER_SOS_HEIGHT_PX = 104;

export const ELDER_TEXT_STEP_IDS = ["pequeno", "medio", "grande"] as const;

export type ElderTextStepId = (typeof ELDER_TEXT_STEP_IDS)[number];

export const ELDER_TEXT_STEPS: Record<
  ElderTextStepId,
  { bodyPx: number; titlePx: number }
> = {
  pequeno: { bodyPx: 17, titlePx: 24 },
  medio: { bodyPx: 20, titlePx: 25 },
  grande: { bodyPx: 23, titlePx: 26 },
};

export const ELDER_CONTRAST = {
  normal: "normal",
  forte: "forte",
} as const;

export type ElderContrast =
  (typeof ELDER_CONTRAST)[keyof typeof ELDER_CONTRAST];

export const ELDER_CUE = {
  som: "som",
  vibrar: "vibrar",
} as const;

export type ElderCue = (typeof ELDER_CUE)[keyof typeof ELDER_CUE];

export interface ElderDisplayPreferences {
  text: ElderTextStepId;
  contrast: ElderContrast;
  cue: ElderCue;
}

export const ELDER_DISPLAY_COOKIE = "zelita_elder_display";
export const ELDER_DISPLAY_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const ALLOWED_COOKIE_KEYS = new Set<string>(["text", "contrast", "cue"]);

const elderDisplaySchema = z.object({
  text: z.enum(ELDER_TEXT_STEP_IDS),
  contrast: z.enum(["normal", "forte"]),
  cue: z.enum(["som", "vibrar"]),
});

export function defaultElderDisplay(): ElderDisplayPreferences {
  return { text: "pequeno", contrast: "normal", cue: "som" };
}

export function elderTextMetrics(step: ElderTextStepId): {
  bodyPx: number;
  titlePx: number;
} {
  return ELDER_TEXT_STEPS[step];
}

export function parseElderDisplayCookie(
  raw: string | null | undefined,
): ElderDisplayPreferences {
  const fallback = defaultElderDisplay();
  if (!raw) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return fallback;
    }
    const record = value as Record<string, unknown>;
    const hasForeignKey = Object.keys(record).some(
      (key) => !ALLOWED_COOKIE_KEYS.has(key),
    );
    if (hasForeignKey) return fallback;
    const parsed = elderDisplaySchema.safeParse(record);
    if (!parsed.success) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}

export function serializeElderDisplay(prefs: ElderDisplayPreferences): string {
  return JSON.stringify({
    text: prefs.text,
    contrast: prefs.contrast,
    cue: prefs.cue,
  });
}
