import { describe, expect, it } from "vitest";

import {
  buildWeekGrid,
  getSundayOfWeek,
  parseWeekParam,
  shiftWeek,
} from "./week-grid";

const TZ = "America/Sao_Paulo";

describe("week-grid", () => {
  it("calcula domingo da semana", () => {
    expect(getSundayOfWeek("2026-08-13")).toBe("2026-08-09");
  });

  it("parseia parâmetro de semana", () => {
    const now = new Date("2026-08-13T12:00:00.000-03:00");
    expect(parseWeekParam("2026-08-09", now, TZ)).toBe("2026-08-09");
    expect(parseWeekParam(null, now, TZ)).toBe("2026-08-09");
  });

  it("navega semanas", () => {
    expect(shiftWeek("2026-08-09", 1)).toBe("2026-08-16");
    expect(shiftWeek("2026-08-09", -1)).toBe("2026-08-02");
  });

  it("combina remédios e consultas na grade", () => {
    const grid = buildWeekGrid({
      weekStartDateKey: "2026-08-09",
      todayDateKey: "2026-08-09",
      timeZone: TZ,
      medications: [
        { name: "Losartana", times: ["08:00"] },
        { name: "Metformina", times: ["12:00", "20:00"] },
      ],
      appointments: [
        {
          title: "Dr. Aurélio",
          startsAt: "2026-08-09T15:00:00.000-03:00",
          status: "scheduled",
        },
      ],
    });

    expect(grid.days).toHaveLength(7);
    expect(grid.days[0]?.isToday).toBe(true);
    expect(grid.rows.length).toBeGreaterThanOrEqual(3);

    const row15 = grid.rows.find((row) => row.timeLabel === "15:00");
    expect(row15?.cells[0]?.items.some((i) => i.label === "Dr. Aurélio")).toBe(
      true,
    );
  });

  it("sem remédios mostra só horários de consultas", () => {
    const grid = buildWeekGrid({
      weekStartDateKey: "2026-08-09",
      todayDateKey: "2026-08-09",
      timeZone: TZ,
      medications: [],
      appointments: [
        {
          title: "Fisioterapia",
          startsAt: "2026-08-13T15:00:00.000-03:00",
          status: "scheduled",
        },
      ],
    });

    expect(grid.rows).toHaveLength(1);
    expect(grid.rows[0]?.timeLabel).toBe("15:00");
  });

  it("ignora consultas canceladas", () => {
    const grid = buildWeekGrid({
      weekStartDateKey: "2026-08-09",
      todayDateKey: "2026-08-09",
      timeZone: TZ,
      medications: [],
      appointments: [
        {
          title: "Cancelada",
          startsAt: "2026-08-09T10:00:00.000-03:00",
          status: "cancelled",
        },
      ],
    });

    expect(grid.rows).toHaveLength(0);
  });
});
