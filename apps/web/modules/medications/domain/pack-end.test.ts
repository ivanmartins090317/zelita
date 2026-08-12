import { describe, expect, it } from "vitest";

import {
  computeDailyConsumption,
  computePackEnd,
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "./pack-end";

describe("computeDailyConsumption", () => {
  it("multiplica dose × doses por dia", () => {
    expect(computeDailyConsumption(1, 2)).toBe(2);
    expect(computeDailyConsumption(2, 3)).toBe(6);
  });

  it("rejeita valores inválidos", () => {
    expect(() => computeDailyConsumption(0, 1)).toThrow(/Dose/);
  });
});

describe("computePackEnd", () => {
  it("usa floor(quantidade / consumo) e fim = início + duração − 1", () => {
    const result = computePackEnd({
      quantityTotal: 30,
      doseUnits: 1,
      dosesPerDay: 1,
      startDate: new Date("2026-08-12T00:00:00.000Z"),
      today: new Date("2026-08-12T00:00:00.000Z"),
    });
    expect(result.durationDays).toBe(30);
    expect(result.endDateEstimated.toISOString().slice(0, 10)).toBe(
      "2026-09-10",
    );
    expect(result.daysRemaining).toBe(29);
  });

  it("exemplo 60 comprimidos, 1×2 ao dia → 30 dias", () => {
    const result = computePackEnd({
      quantityTotal: 60,
      doseUnits: 1,
      dosesPerDay: 2,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      today: new Date("2026-01-01T00:00:00.000Z"),
    });
    expect(result.dailyConsumption).toBe(2);
    expect(result.durationDays).toBe(30);
    expect(result.endDateEstimated.toISOString().slice(0, 10)).toBe(
      "2026-01-30",
    );
  });
});

describe("shouldWarnRefill", () => {
  it("avisa quando faltam N dias ou menos (padrão 5)", () => {
    expect(shouldWarnRefill(5, DEFAULT_REFILL_ALERT_DAYS)).toBe(true);
    expect(shouldWarnRefill(6, DEFAULT_REFILL_ALERT_DAYS)).toBe(false);
    expect(shouldWarnRefill(0)).toBe(true);
  });
});
