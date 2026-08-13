import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import { SOS_ALERT_STATUS } from "./sos-alert-status";
import {
  buildHistorySummary,
  buildResolutionOutcomeLine,
  computeResolutionDurationMinutes,
  normalizeResolutionNote,
  shouldShowResolveAction,
  validateResolveSosAlert,
} from "./sos-resolution";

describe("sos-resolution", () => {
  it("valida resolução de pedido aberto", () => {
    expect(
      validateResolveSosAlert({
        currentStatus: SOS_ALERT_STATUS.open,
        actorRole: ACCOUNT_ROLES.admin,
      }),
    ).toEqual({ ok: true });
    expect(
      validateResolveSosAlert({
        currentStatus: SOS_ALERT_STATUS.open,
        actorRole: ACCOUNT_ROLES.viewer,
      }).ok,
    ).toBe(false);
    expect(
      validateResolveSosAlert({
        currentStatus: SOS_ALERT_STATUS.resolved,
        actorRole: ACCOUNT_ROLES.admin,
      }),
    ).toMatchObject({ ok: false, reason: "already_resolved" });
  });

  it("normaliza observação com limite", () => {
    expect(normalizeResolutionNote("  ")).toBeNull();
    expect(normalizeResolutionNote("tontura")).toBe("tontura");
    expect(normalizeResolutionNote("x".repeat(600))?.length).toBe(500);
  });

  it("monta desfecho com e sem observação", () => {
    expect(
      buildResolutionOutcomeLine(
        "Cintia",
        "19:47",
        "passou",
        "Resolvido por {nome} às {hora} — {observacao}",
        "Resolvido por {nome} às {hora}",
      ),
    ).toBe("Resolvido por Cintia às 19:47 — passou");
    expect(
      buildResolutionOutcomeLine(
        "Cintia",
        "19:47",
        null,
        "Resolvido por {nome} às {hora} — {observacao}",
        "Resolvido por {nome} às {hora}",
      ),
    ).toBe("Resolvido por Cintia às 19:47");
  });

  it("calcula duração em minutos", () => {
    const triggered = new Date("2026-07-28T19:42:00-03:00");
    const resolved = new Date("2026-07-28T19:47:00-03:00");
    expect(computeResolutionDurationMinutes(triggered, resolved)).toBe(5);
  });

  it("resume histórico por status", () => {
    const copy = {
      resolvedInMinutes: "Resolvido em {minutos} min",
      resolvedWithNote: "Resolvido em 5 min · {observacao}",
      cancelled: "Cancelado pelo idoso na confirmação",
      open: "Aberto",
    };
    expect(
      buildHistorySummary({
        status: SOS_ALERT_STATUS.cancelled,
        triggeredAt: new Date(),
        resolvedAt: null,
        resolutionNote: null,
        copy,
      }),
    ).toBe(copy.cancelled);
    expect(
      buildHistorySummary({
        status: SOS_ALERT_STATUS.resolved,
        triggeredAt: new Date("2026-07-28T19:42:00-03:00"),
        resolvedAt: new Date("2026-07-28T19:47:00-03:00"),
        resolutionNote: null,
        copy,
      }),
    ).toBe("Resolvido em 5 min");
  });

  it("exibe ação resolver só para papéis autorizados em alerta aberto", () => {
    expect(
      shouldShowResolveAction(SOS_ALERT_STATUS.open, ACCOUNT_ROLES.caregiver),
    ).toBe(true);
    expect(
      shouldShowResolveAction(SOS_ALERT_STATUS.resolved, ACCOUNT_ROLES.admin),
    ).toBe(false);
  });
});
