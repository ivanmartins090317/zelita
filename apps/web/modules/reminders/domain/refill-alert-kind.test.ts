import { describe, expect, it } from "vitest";

import {
  classifyRefillAlert,
  REFILL_ALERT_KINDS,
  refillEventType,
} from "./refill-alert-kind";
import { hasProcessedOccurrence } from "./reminder-idempotency";

describe("classifyRefillAlert", () => {
  it("classifica 5 dias, véspera e último dia", () => {
    expect(classifyRefillAlert(5, 5)).toBe(REFILL_ALERT_KINDS.warning);
    expect(classifyRefillAlert(3, 5)).toBe(REFILL_ALERT_KINDS.warning);
    expect(classifyRefillAlert(1, 5)).toBe(REFILL_ALERT_KINDS.eve);
    expect(classifyRefillAlert(0, 5)).toBe(REFILL_ALERT_KINDS.lastDay);
    expect(classifyRefillAlert(8, 5)).toBe(REFILL_ALERT_KINDS.none);
  });

  it("mapeia para o tipo de evento existente", () => {
    expect(refillEventType(REFILL_ALERT_KINDS.eve)).toBe("pack_refill_warning");
    expect(refillEventType(REFILL_ALERT_KINDS.lastDay)).toBe("pack_last_day");
    expect(refillEventType(REFILL_ALERT_KINDS.none)).toBeNull();
  });
});

describe("hasProcessedOccurrence", () => {
  it("impede retry duplicado", () => {
    const scheduledAt = "2026-09-21T11:00:00.000Z";
    expect(
      hasProcessedOccurrence(
        [{ packId: "p1", type: "reminder_sent", scheduledAt }],
        "p1",
        scheduledAt,
      ),
    ).toBe(true);
    expect(
      hasProcessedOccurrence(
        [{ packId: "p1", type: "reminder_sent", scheduledAt }],
        "p1",
        "2026-09-21T23:00:00.000Z",
      ),
    ).toBe(false);
  });
});
