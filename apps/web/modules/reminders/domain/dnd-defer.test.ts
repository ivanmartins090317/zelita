import { describe, expect, it } from "vitest";

import { DND_ACTIONS, resolveDndAction } from "./dnd-defer";

describe("resolveDndAction", () => {
  it("envia agora fora do DND", () => {
    const result = resolveDndAction({
      scheduledAt: new Date("2026-09-21T15:00:00.000-03:00"),
      dnd: { start: "22:00", end: "07:00" },
    });
    expect(result.action).toBe(DND_ACTIONS.sendNow);
  });

  it("adia para o fim da janela no mesmo dia", () => {
    const result = resolveDndAction({
      scheduledAt: new Date("2026-09-21T13:00:00.000-03:00"),
      dnd: { start: "12:00", end: "14:00" },
    });
    expect(result.action).toBe(DND_ACTIONS.defer);
    if (result.action === DND_ACTIONS.defer) {
      expect(result.sendAt.toISOString()).toBe("2026-09-21T17:00:00.000Z");
    }
  });

  it("pula quando o DND atravessa meia-noite no período da noite", () => {
    const result = resolveDndAction({
      scheduledAt: new Date("2026-09-21T23:00:00.000-03:00"),
      dnd: { start: "22:00", end: "07:00" },
    });
    expect(result).toEqual({
      action: DND_ACTIONS.skip,
      reason: "dnd_crosses_midnight",
    });
  });

  it("adia de manhã até o fim do DND que atravessa meia-noite", () => {
    const result = resolveDndAction({
      scheduledAt: new Date("2026-09-21T06:00:00.000-03:00"),
      dnd: { start: "22:00", end: "07:00" },
    });
    expect(result.action).toBe(DND_ACTIONS.defer);
    if (result.action === DND_ACTIONS.defer) {
      expect(result.sendAt.toISOString()).toBe("2026-09-21T10:00:00.000Z");
    }
  });

  it("pula quando o adiamento colide com o próximo horário", () => {
    const result = resolveDndAction({
      scheduledAt: new Date("2026-09-21T13:00:00.000-03:00"),
      dnd: { start: "12:00", end: "14:00" },
      nextSlotAt: new Date("2026-09-21T13:30:00.000-03:00"),
    });
    expect(result).toEqual({
      action: DND_ACTIONS.skip,
      reason: "dnd_collides_next_slot",
    });
  });
});
