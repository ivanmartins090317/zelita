import { describe, expect, it } from "vitest";

import { buildReminderPreview } from "./message-preview";
import {
  buildReminderPreviewWithMedication,
  pickFirstMedicationForPreview,
} from "./message-preview-with-medication";

describe("buildReminderPreviewWithMedication", () => {
  const base = {
    tone: "carinhoso" as const,
    careDisplayName: "Seu João",
    managerName: "Cintia",
  };

  it("usa remédio e dose quando informados", () => {
    const text = buildReminderPreviewWithMedication({
      ...base,
      medication: {
        time: "08:00",
        medicationName: "Losartana",
        dosageLabel: "50 mg",
      },
    });

    expect(text).toContain("Losartana");
    expect(text).toContain("50 mg");
    expect(text.toLowerCase()).not.toContain("tomou");
  });

  it("cai no preview genérico sem remédio", () => {
    expect(buildReminderPreviewWithMedication(base)).toBe(
      buildReminderPreview(base),
    );
  });
});

describe("pickFirstMedicationForPreview", () => {
  it("escolhe o horário mais cedo entre remédios ativos", () => {
    expect(
      pickFirstMedicationForPreview([
        {
          medicationName: "Losartana",
          dosageLabel: "50 mg",
          times: ["09:00"],
        },
        {
          medicationName: "AAS",
          dosageLabel: "100 mg",
          times: ["08:00", "20:00"],
        },
      ]),
    ).toEqual({
      time: "08:00",
      medicationName: "AAS",
      dosageLabel: "100 mg",
    });
  });

  it("retorna null sem horários", () => {
    expect(
      pickFirstMedicationForPreview([
        { medicationName: "Losartana", dosageLabel: "50 mg", times: [] },
      ]),
    ).toBeNull();
  });
});
