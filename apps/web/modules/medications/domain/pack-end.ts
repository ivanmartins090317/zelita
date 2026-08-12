/**
 * Cálculo de fim de cartela (PRD §5.1).
 * lembrete ≠ tomada — este módulo só estima duração da cartela.
 */

export interface PackEndInput {
  quantityTotal: number;
  doseUnits: number;
  dosesPerDay: number;
  startDate: Date;
  today?: Date;
}

export interface PackEndResult {
  dailyConsumption: number;
  durationDays: number;
  endDateEstimated: Date;
  daysRemaining: number;
}

export const DEFAULT_REFILL_ALERT_DAYS = 5;

export function computeDailyConsumption(
  doseUnits: number,
  dosesPerDay: number,
): number {
  if (doseUnits <= 0 || dosesPerDay <= 0) {
    throw new Error(
      "Dose e doses por dia devem ser > 0. Corrija os valores da cartela.",
    );
  }
  return doseUnits * dosesPerDay;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number): Date {
  const next = startOfUtcDay(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function computePackEnd(input: PackEndInput): PackEndResult {
  if (input.quantityTotal <= 0) {
    throw new Error(
      "Quantidade na cartela deve ser > 0. Informe quantos comprimidos vieram na caixa.",
    );
  }

  const dailyConsumption = computeDailyConsumption(
    input.doseUnits,
    input.dosesPerDay,
  );
  const durationDays = Math.floor(input.quantityTotal / dailyConsumption);
  if (durationDays < 1) {
    throw new Error(
      "A cartela não cobre nem um dia com esse consumo. Confira quantidade e doses.",
    );
  }

  const start = startOfUtcDay(input.startDate);
  const endDateEstimated = addUtcDays(start, durationDays - 1);
  const today = startOfUtcDay(input.today ?? new Date());
  const daysRemaining = Math.round(
    (endDateEstimated.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  return {
    dailyConsumption,
    durationDays,
    endDateEstimated,
    daysRemaining,
  };
}

export function shouldWarnRefill(
  daysRemaining: number,
  refillAlertDays: number = DEFAULT_REFILL_ALERT_DAYS,
): boolean {
  return daysRemaining <= refillAlertDays;
}

export function formatPackEndLabel(endDate: Date): string {
  return endDate.toISOString().slice(0, 10);
}
