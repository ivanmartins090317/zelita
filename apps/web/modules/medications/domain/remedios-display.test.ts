import { describe, expect, it } from "vitest";

import {
  buildPackConsumptionDisplay,
  buildPackPreview,
  buildScheduledAlerts,
  computeBuyUntilDate,
  computeEstimatedConsumption,
  formatMedicationListSubtitle,
  mapRemediosListItem,
  resolveListTag,
  resolveSelectedMedicationId,
  sortMedicationsByUrgency,
} from "./remedios-display";

describe("formatMedicationListSubtitle", () => {
  it("monta linha com horários", () => {
    expect(
      formatMedicationListSubtitle({
        doseUnits: 1,
        dosesPerDay: 2,
        times: ["12:00", "20:00"],
        asNeededCopy: "Se necessário · sem horário fixo",
        noScheduleCopy: "Sem horário",
      }),
    ).toBe("1 comprimido · 2x ao dia · 12:00 e 20:00");
  });

  it("usa copy de se necessário sem horários", () => {
    expect(
      formatMedicationListSubtitle({
        doseUnits: 1,
        dosesPerDay: 1,
        times: [],
        asNeededCopy: "Se necessário · sem horário fixo",
        noScheduleCopy: "Sem horário",
      }),
    ).toBe("Se necessário · sem horário fixo");
  });
});

describe("resolveListTag", () => {
  it("marca alerta âmbar quando faltam poucos dias", () => {
    const tag = resolveListTag({
      times: ["08:00"],
      daysRemaining: 3,
      refillAlertDays: 5,
      warnLabel: "Faltam {dias} dias",
      okLabel: "{dias} dias restantes",
      noReminderLabel: "Sem lembrete",
    });
    expect(tag.tagTone).toBe("warning");
    expect(tag.tagLabel).toBe("Faltam 3 dias");
  });

  it("usa etiqueta neutra sem horários", () => {
    const tag = resolveListTag({
      times: [],
      daysRemaining: 10,
      refillAlertDays: 5,
      warnLabel: "Faltam {dias} dias",
      okLabel: "{dias} dias restantes",
      noReminderLabel: "Sem lembrete",
    });
    expect(tag.tagTone).toBe("muted");
    expect(tag.tagLabel).toBe("Sem lembrete");
  });
});

describe("sortMedicationsByUrgency", () => {
  it("ordena por dias restantes e depois nome", () => {
    const sorted = sortMedicationsByUrgency([
      { name: "Metformina", daysRemaining: 18 },
      { name: "Losartana", daysRemaining: 5 },
      { name: "Aspirina", daysRemaining: 5 },
    ]);
    expect(sorted.map((item) => item.name)).toEqual([
      "Aspirina",
      "Losartana",
      "Metformina",
    ]);
  });
});

describe("computeBuyUntilDate", () => {
  it("subtrai dias de alerta do fim estimado", () => {
    expect(computeBuyUntilDate("2026-08-30", 5)).toBe("2026-08-25");
  });
});

describe("computeEstimatedConsumption", () => {
  it("estima por dias decorridos quando quantity_remaining está plena", () => {
    const consumed = computeEstimatedConsumption({
      quantityTotal: 30,
      quantityRemaining: 30,
      startDate: "2026-08-01",
      doseUnits: 1,
      dosesPerDay: 1,
      todayIso: "2026-08-26",
    });
    expect(consumed).toBe(25);
  });

  it("usa diferença persistida quando quantity_remaining foi decrementada", () => {
    const consumed = computeEstimatedConsumption({
      quantityTotal: 30,
      quantityRemaining: 20,
      startDate: "2026-08-01",
      doseUnits: 1,
      dosesPerDay: 1,
      todayIso: "2026-08-05",
    });
    expect(consumed).toBe(10);
  });
});

describe("buildPackConsumptionDisplay", () => {
  it("calcula barra e copy de compra", () => {
    const display = buildPackConsumptionDisplay({
      quantityTotal: 30,
      quantityRemaining: 30,
      startDate: "2026-08-01",
      endDateEstimated: "2026-08-30",
      doseUnits: 1,
      dosesPerDay: 1,
      refillAlertDays: 5,
      todayIso: "2026-08-26",
      consumedTemplate: "Pela conta, já foram {consumido} dos {total} comprimidos.",
      buyUntilTemplate: "Compre outra caixa até {data}",
    });

    expect(display.consumedUnits).toBe(25);
    expect(display.progressPercent).toBe(83);
    expect(display.progressTone).toBe("warning");
    expect(display.buyUntilDate).toBe("2026-08-25");
  });
});

describe("buildScheduledAlerts", () => {
  it("marca enviado quando há evento correspondente", () => {
    const rows = buildScheduledAlerts({
      endDateEstimated: "2026-08-30",
      refillAlertDays: 5,
      packEvents: [
        {
          type: "pack_refill_warning",
          createdAt: "2026-08-25T13:30:00.000Z",
        },
      ],
      labels: {
        refillDays: "Faltam {dias} dias",
        endsTomorrow: "Termina amanhã",
        lastPill: "Último comprimido",
        registerPurchase: "Cadastre nova compra",
        sentAt: "Enviado {data}",
        scheduledFor: "Programado {data}",
        recipients: "administradores da conta",
      },
    });

    expect(rows[0]?.statusLabel).toContain("Enviado");
    expect(rows[1]?.statusLabel).toContain("Programado");
  });
});

describe("resolveSelectedMedicationId", () => {
  it("ignora id inválido e usa o primeiro da lista", () => {
    expect(
      resolveSelectedMedicationId({
        requestedId: "invalid",
        medicationIds: ["a", "b"],
      }),
    ).toBe("a");
  });

  it("respeita id válido na URL", () => {
    expect(
      resolveSelectedMedicationId({
        requestedId: "b",
        medicationIds: ["a", "b"],
      }),
    ).toBe("b");
  });
});

describe("buildPackPreview", () => {
  it("calcula preview válido", () => {
    const preview = buildPackPreview({
      quantityTotal: 30,
      doseUnits: 1,
      dosesPerDay: 1,
      startDate: "2026-08-12",
      invalidCopy: "Ajuste os valores.",
    });
    expect(preview.ok).toBe(true);
    if (preview.ok) {
      expect(preview.durationDays).toBe(30);
      expect(preview.buyUntilDate).toBe("2026-09-05");
    }
  });

  it("retorna mensagem quando combinação é inválida", () => {
    const preview = buildPackPreview({
      quantityTotal: 1,
      doseUnits: 2,
      dosesPerDay: 2,
      startDate: "2026-08-12",
      invalidCopy: "Ajuste os valores.",
    });
    expect(preview.ok).toBe(false);
  });
});

describe("mapRemediosListItem", () => {
  it("monta item de lista completo", () => {
    const item = mapRemediosListItem(
      {
        medicationId: "1",
        name: "Losartana",
        dosageLabel: "50 mg",
        times: ["08:00"],
        doseUnits: 1,
        dosesPerDay: 1,
        daysRemaining: 5,
        refillAlertDays: 5,
      },
      {
        asNeeded: "Se necessário · sem horário fixo",
        noSchedule: "Sem horário",
        warnDays: "Faltam {dias} dias",
        okDays: "{dias} dias restantes",
        noReminder: "Sem lembrete",
      },
    );

    expect(item.title).toBe("Losartana 50 mg");
    expect(item.tagTone).toBe("warning");
  });
});
