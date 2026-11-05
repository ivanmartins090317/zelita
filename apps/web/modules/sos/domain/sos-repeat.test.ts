import { describe, expect, it } from "vitest";

import {
  SOS_REPEAT_WINDOW_MS,
  shouldHoldOpenSosRepeat,
} from "./sos-repeat";

const NOW = new Date("2026-11-05T15:00:00.000Z");

describe("shouldHoldOpenSosRepeat", () => {
  it("não segura quando não há pedido aberto", () => {
    expect(
      shouldHoldOpenSosRepeat({ now: NOW, openAlertTriggeredAt: null }),
    ).toBe(false);
  });

  it("segura o pedido aberto há menos de 2 minutos", () => {
    const triggeredAt = new Date(NOW.getTime() - 60_000);
    expect(
      shouldHoldOpenSosRepeat({ now: NOW, openAlertTriggeredAt: triggeredAt }),
    ).toBe(true);
  });

  it("não segura no instante em que a janela completa 2 minutos", () => {
    const triggeredAt = new Date(NOW.getTime() - SOS_REPEAT_WINDOW_MS);
    expect(
      shouldHoldOpenSosRepeat({ now: NOW, openAlertTriggeredAt: triggeredAt }),
    ).toBe(false);
  });

  it("não segura o pedido aberto há mais de 2 minutos", () => {
    const triggeredAt = new Date(NOW.getTime() - SOS_REPEAT_WINDOW_MS - 1);
    expect(
      shouldHoldOpenSosRepeat({ now: NOW, openAlertTriggeredAt: triggeredAt }),
    ).toBe(false);
  });

  it("pedido resolvido não segura, porque não há aberto para consultar", () => {
    expect(
      shouldHoldOpenSosRepeat({ now: NOW, openAlertTriggeredAt: null }),
    ).toBe(false);
  });

  it("não segura um horário no futuro", () => {
    const triggeredAt = new Date(NOW.getTime() + 1_000);
    expect(
      shouldHoldOpenSosRepeat({ now: NOW, openAlertTriggeredAt: triggeredAt }),
    ).toBe(false);
  });
});
