import { describe, expect, it } from "vitest";

import {
  buildActivityFeed,
  buildDayTimeline,
  computeRefillAlertSummary,
  findNextMedication,
  formatLongDate,
  formatRelativeUntil,
  resolveTimeGreeting,
} from "./hoje-timeline";

const meds = [
  {
    medicationId: "m1",
    medicationName: "Losartana",
    dosageLabel: "50 mg",
    times: ["08:00", "20:00"],
    endDateEstimated: "2026-08-30",
    daysRemaining: 3,
    refillAlertDays: 5,
    createdAt: "2026-08-12T10:00:00.000Z",
  },
  {
    medicationId: "m2",
    medicationName: "Metformina",
    dosageLabel: "850 mg",
    times: ["12:00"],
    endDateEstimated: "2026-09-01",
    daysRemaining: 20,
    refillAlertDays: 5,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
];

const timelineCopy = {
  completedStatus: "concluído",
  reminderSent: "{medicamento} — lembrete enviado no WhatsApp",
  notConfirmed: "tomada não confirmada",
  confirmed: "tomada confirmada",
  upcoming: "{medicamento} — lembrete será enviado",
  refillTitle: "A {medicamento} deve acabar em {dias} dias",
  refillSubtitle: "Compre outra caixa até {data}",
  linkLabel: "anotar a nova caixa",
};

describe("resolveTimeGreeting", () => {
  it("retorna saudações por faixa horária", () => {
    expect(resolveTimeGreeting(8)).toBe("Bom dia");
    expect(resolveTimeGreeting(14)).toBe("Boa tarde");
    expect(resolveTimeGreeting(21)).toBe("Boa noite");
  });
});

describe("formatLongDate", () => {
  it("formata data por extenso em pt-BR", () => {
    const formatted = formatLongDate(
      new Date("2026-08-12T15:00:00.000Z"),
      "America/Sao_Paulo",
    );
    expect(formatted.toLowerCase()).toContain("agosto");
  });
});

describe("findNextMedication", () => {
  it("encontra próximo horário futuro no dia", () => {
    const now = new Date("2026-08-12T13:00:00.000-03:00");
    const next = findNextMedication(meds, now, "America/Sao_Paulo");
    expect(next?.timeLabel).toBe("20:00");
    expect(next?.medicationLabel).toContain("Losartana");
  });
});

describe("computeRefillAlertSummary", () => {
  it("conta cartelas em alerta e prioriza a mais urgente", () => {
    const summary = computeRefillAlertSummary(meds);
    expect(summary.count).toBe(1);
    expect(summary.mostUrgentName).toBe("Losartana");
    expect(summary.mostUrgentDays).toBe(3);
  });
});

describe("buildDayTimeline", () => {
  it("inclui slots previstos e alerta de cartela", () => {
    const now = new Date("2026-08-12T13:00:00.000-03:00");
    const items = buildDayTimeline(
      meds,
      [],
      now,
      "America/Sao_Paulo",
      timelineCopy,
      "/familia/remedios",
    );

    expect(items.some((item) => item.variant === "muted")).toBe(true);
    expect(items.some((item) => item.variant === "warning")).toBe(true);
  });

  it("marca lembrete enviado como concluído sem confundir com tomada", () => {
    const now = new Date("2026-08-12T09:00:00.000-03:00");
    const items = buildDayTimeline(
      [meds[0]],
      [
        {
          id: "e1",
          type: "reminder_sent",
          medicationId: "m1",
          createdAt: "2026-08-12T11:00:00.000Z",
          actorProfileId: null,
        },
      ],
      now,
      "America/Sao_Paulo",
      timelineCopy,
      "/familia/remedios",
    );

    expect(items[0]?.subtitle).toBe("tomada não confirmada");
  });
});

describe("buildActivityFeed", () => {
  it("limita a cinco entradas", () => {
    const events = Array.from({ length: 8 }, (_, index) => ({
      id: `e${index}`,
      type: "reminder_sent",
      medicationId: "m1",
      createdAt: `2026-08-12T1${index}:00:00.000Z`,
      actorProfileId: null,
    }));

    const feed = buildActivityFeed(
      meds,
      events,
      new Map(),
      new Map(),
      {
        reminderSent: "lembrete — {medicamento}",
        refillWarning: "cartela — {medicamento}",
        manualConfirmation: "confirmou — {medicamento}",
        medicationAdded: "anotou {medicamento}",
        emptyToday: "vazio",
      },
      new Date("2026-08-12T23:00:00.000Z"),
      "America/Sao_Paulo",
    );

    expect(feed.length).toBeLessThanOrEqual(5);
  });
});

describe("formatRelativeUntil", () => {
  it("formata intervalo até o próximo horário", () => {
    const now = new Date("2026-08-12T10:00:00.000Z");
    const target = new Date("2026-08-12T12:14:00.000Z");
    expect(formatRelativeUntil(target, now)).toBe("daqui a 2h14");
  });
});
