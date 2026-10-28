import { describe, expect, it } from "vitest";

import {
  ELDER_TIME_ZONE,
  ELDER_SLOT_LABELS,
  buildElderHomeCard,
  buildElderSchedule,
  canOpenElderPreview,
  elderFirstName,
  elderSosPersistsAlert,
  formatElderGreetingLine,
  formatElderLongDate,
  labelMedicationSlot,
  readZonedClock,
  remindedTimesFromActivity,
  resolveElderGreeting,
} from "./elder-schedule";

const losartana = {
  medicationId: "losartana",
  medicationName: "Losartana",
  dosageLabel: "50 mg",
  times: ["08:00", "20:00"],
  remindedTimes: [],
};

const metformina = {
  medicationId: "metformina",
  medicationName: "Metformina",
  dosageLabel: "850 mg",
  times: ["12:00"],
  remindedTimes: [],
};

describe("saudação do idoso", () => {
  it("separa manhã, tarde e noite no relógio de 24 horas", () => {
    expect(resolveElderGreeting(0)).toBe("Bom dia");
    expect(resolveElderGreeting(11)).toBe("Bom dia");
    expect(resolveElderGreeting(12)).toBe("Boa tarde");
    expect(resolveElderGreeting(17)).toBe("Boa tarde");
    expect(resolveElderGreeting(18)).toBe("Boa noite");
    expect(resolveElderGreeting(23)).toBe("Boa noite");
  });

  it("usa o primeiro nome e o fuso de São Paulo", () => {
    expect(elderFirstName("João da Silva")).toBe("João");
    expect(formatElderGreetingLine(9, "João da Silva")).toBe("Bom dia, João");
    expect(formatElderGreetingLine(9, "  ")).toBe("Bom dia");

    const morning = readZonedClock(
      new Date("2026-08-09T14:30:00.000Z"),
      ELDER_TIME_ZONE,
    );
    expect(morning.hour).toBe(11);
    expect(resolveElderGreeting(morning.hour)).toBe("Bom dia");

    const afternoon = readZonedClock(
      new Date("2026-08-09T15:00:00.000Z"),
      ELDER_TIME_ZONE,
    );
    expect(afternoon).toEqual({ hour: 12, minute: 0 });
    expect(resolveElderGreeting(afternoon.hour)).toBe("Boa tarde");

    const dateLabel = formatElderLongDate(
      new Date("2026-08-09T15:00:00.000Z"),
      ELDER_TIME_ZONE,
    );
    expect(dateLabel.toLowerCase()).toContain("agosto");
    expect(dateLabel[0]).toBe(dateLabel[0]?.toLocaleUpperCase("pt-BR"));
  });
});

describe("próximo horário e rótulos", () => {
  const nowMinutes = 10 * 60;

  it("escolhe o primeiro horário de hoje que ainda não venceu", () => {
    const card = buildElderHomeCard([losartana, metformina], nowMinutes);
    expect(card).toEqual({
      kind: "next",
      medicationName: "Metformina",
      dosageLabel: "850 mg",
      timeLabel: "12:00",
    });
  });

  it("não inventa próximo remédio quando o dia já passou", () => {
    expect(buildElderHomeCard([losartana, metformina], 21 * 60)).toEqual({
      kind: "finished",
    });
  });

  it("fica vazio sem cartela", () => {
    expect(buildElderHomeCard([], nowMinutes)).toEqual({ kind: "empty" });
  });

  it("marca passado, próximo e mais tarde, e a consulta entra sem rótulo de aviso", () => {
    const items = buildElderSchedule({
      medications: [losartana, metformina],
      appointments: [{ timeLabel: "15:00 · previsto", title: "Dr. Aurélio" }],
      nowMinutes,
    });

    expect(items.map((item) => [item.timeLabel, item.kind, item.statusLabel, item.title])).toEqual([
      ["08:00", "medication", ELDER_SLOT_LABELS.already, "Losartana"],
      ["12:00", "medication", ELDER_SLOT_LABELS.next, "Metformina"],
      ["15:00", "appointment", null, "Consulta · Dr. Aurélio"],
      ["20:00", "medication", ELDER_SLOT_LABELS.later, "Losartana"],
    ]);
    expect(items.some((item) => item.kind === "appointment" && item.title.includes("Consulta"))).toBe(true);
    expect(JSON.stringify(items).toLowerCase()).not.toContain("tomou");
    expect(items.every((item) => item.kind === "medication" || item.kind === "appointment")).toBe(true);
  });

  it("trata lembrete enviado como já avisamos, mesmo antes do horário", () => {
    expect(
      labelMedicationSlot({
        minutes: 12 * 60,
        nowMinutes,
        reminderSent: true,
        isNext: true,
      }),
    ).toBe(ELDER_SLOT_LABELS.already);

    const card = buildElderHomeCard(
      [{ ...metformina, remindedTimes: ["12:00"] }, losartana],
      nowMinutes,
    );
    expect(card).toMatchObject({ kind: "next", timeLabel: "20:00" });
  });

  it("só associa lembrete quando há um horário e o texto fala de lembrete", () => {
    expect(
      remindedTimesFromActivity({
        medicationName: "Losartana",
        dosageLabel: "50 mg",
        times: ["08:00"],
        activityTitles: ["Zelita — lembrete enviado de Losartana 50 mg"],
      }),
    ).toEqual(["08:00"]);

    expect(
      remindedTimesFromActivity({
        medicationName: "Losartana",
        dosageLabel: "50 mg",
        times: ["08:00"],
        activityTitles: ["Ana confirmou Losartana 50 mg"],
      }),
    ).toEqual([]);

    expect(
      remindedTimesFromActivity({
        medicationName: "Losartana",
        dosageLabel: "50 mg",
        times: ["08:00", "20:00"],
        activityTitles: ["lembrete enviado de Losartana 50 mg"],
      }),
    ).toEqual([]);
  });
});

describe("porta da prévia", () => {
  it("exige sessão e permissão de ver a rotina", () => {
    expect(canOpenElderPreview({ hasSession: false, canViewRoutine: true })).toBe(false);
    expect(canOpenElderPreview({ hasSession: true, canViewRoutine: false })).toBe(false);
    expect(canOpenElderPreview({ hasSession: true, canViewRoutine: true })).toBe(true);
  });

  it("não grava alerta nesta fase", () => {
    expect(elderSosPersistsAlert()).toBe(false);
  });
});
