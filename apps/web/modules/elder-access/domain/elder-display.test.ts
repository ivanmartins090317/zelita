import { describe, expect, it } from "vitest";

import {
  ELDER_BODY_FLOOR_PX,
  ELDER_SOS_HEIGHT_PX,
  ELDER_TAP_MIN_PX,
  ELDER_TEXT_STEPS,
  ELDER_TITLE_MAX_PX,
  ELDER_TITLE_MIN_PX,
  parseElderDisplayCookie,
  serializeElderDisplay,
} from "./elder-display";

describe("ajuste de leitura", () => {
  it("mantém o piso de 17px e o título entre 23 e 26", () => {
    for (const step of Object.values(ELDER_TEXT_STEPS)) {
      expect(step.bodyPx).toBeGreaterThanOrEqual(ELDER_BODY_FLOOR_PX);
      expect(step.titlePx).toBeGreaterThanOrEqual(ELDER_TITLE_MIN_PX);
      expect(step.titlePx).toBeLessThanOrEqual(ELDER_TITLE_MAX_PX);
    }
    expect(ELDER_TEXT_STEPS.pequeno.bodyPx).toBe(ELDER_BODY_FLOOR_PX);
    expect(ELDER_TAP_MIN_PX).toBeGreaterThanOrEqual(56);
    expect(ELDER_SOS_HEIGHT_PX).toBeGreaterThan(100);
  });

  it("lê o cookie sem dado de saúde e rejeita campo estranho", () => {
    expect(parseElderDisplayCookie(null)).toEqual({
      text: "pequeno",
      contrast: "normal",
      cue: "som",
    });

    const saved = serializeElderDisplay({
      text: "grande",
      contrast: "forte",
      cue: "vibrar",
    });
    expect(parseElderDisplayCookie(saved)).toEqual({
      text: "grande",
      contrast: "forte",
      cue: "vibrar",
    });
    expect(saved).not.toContain("Losartana");

    expect(
      parseElderDisplayCookie(
        JSON.stringify({
          text: "medio",
          contrast: "forte",
          cue: "som",
          medicationName: "Losartana",
        }),
      ),
    ).toEqual({
      text: "pequeno",
      contrast: "normal",
      cue: "som",
    });

    expect(parseElderDisplayCookie("{")).toEqual({
      text: "pequeno",
      contrast: "normal",
      cue: "som",
    });
  });
});
