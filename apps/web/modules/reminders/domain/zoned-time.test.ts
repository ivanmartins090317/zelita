import { describe, expect, it } from "vitest";

import {
  calendarDaysUntil,
  clockMatchesSchedule,
  dateKeyInZone,
  remainingSlotsToday,
  slotsOnDate,
  zonedDateFromHm,
} from "./zoned-time";

describe("zonedDateFromHm", () => {
  it("ancora 08:00 em Brasília, não em UTC", () => {
    const scheduled = zonedDateFromHm("2026-09-21", "08:00");
    expect(scheduled.toISOString()).toBe("2026-09-21T11:00:00.000Z");
  });
});

describe("remainingSlotsToday", () => {
  it("devolve só horários futuros de hoje", () => {
    const now = new Date("2026-09-21T15:00:00.000-03:00");
    const slots = remainingSlotsToday(["08:00", "20:00"], now);
    expect(slots.map((slot) => slot.time)).toEqual(["20:00"]);
  });

  it("não agenda o passado de hoje", () => {
    const now = new Date("2026-09-21T21:00:00.000-03:00");
    expect(remainingSlotsToday(["08:00", "20:00"], now)).toEqual([]);
  });
});

describe("clockMatchesSchedule", () => {
  it("reconhece o horário de Brasília ainda cadastrado", () => {
    const scheduled = zonedDateFromHm("2026-10-26", "09:30");
    expect(clockMatchesSchedule(scheduled, ["08:00", "09:30"])).toBe(true);
  });

  it("ignora horário que saiu da cartela", () => {
    const scheduled = zonedDateFromHm("2026-10-26", "08:00");
    expect(clockMatchesSchedule(scheduled, ["09:30"])).toBe(false);
  });
});

describe("slotsOnDate", () => {
  it("materializa todos os horários do dia", () => {
    const slots = slotsOnDate(["08:00", "20:00"], "2026-09-22");
    expect(slots).toHaveLength(2);
    expect(dateKeyInZone(slots[0]!.scheduledAt)).toBe("2026-09-22");
  });
});

describe("calendarDaysUntil", () => {
  it("conta dias civis em Brasília", () => {
    const now = new Date("2026-09-21T22:00:00.000-03:00");
    const end = new Date("2026-09-26T18:00:00.000-03:00");
    expect(calendarDaysUntil(end, now)).toBe(5);
  });
});
