import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  buildEscalationChannelLabel,
  formatNotificationAttemptLine,
} from "../domain/sos-escalation-labels";
import { isDefaultEligibleForEscalation } from "../domain/sos-eligibility";
import { buildHistorySummary } from "../domain/sos-resolution";
import { SOS_ALERT_STATUS } from "../domain/sos-alert-status";

describe("getPedidosDeAjudaPage helpers", () => {
  const channels = {
    adminChannel: "Ligação + WhatsApp · imediato",
    caregiverChannel: "WhatsApp · imediato",
    viewerChannel: "WhatsApp · imediato",
    emergencyImmediate: "Ligação + WhatsApp · imediato",
    emergencyDelayed: "Ligação · se ninguém responder em 2 min",
  };

  it("monta candidatos padrão excluindo visualizador", () => {
    const roles = [
      ACCOUNT_ROLES.admin,
      ACCOUNT_ROLES.caregiver,
      ACCOUNT_ROLES.viewer,
      ACCOUNT_ROLES.emergency_contact,
    ];
    const eligible = roles.filter((role) =>
      isDefaultEligibleForEscalation(role),
    );
    expect(eligible).not.toContain(ACCOUNT_ROLES.viewer);
    expect(eligible).toHaveLength(3);
  });

  it("formata linha de escalonamento para admin", () => {
    expect(
      buildEscalationChannelLabel(ACCOUNT_ROLES.admin, 1, 2, channels),
    ).toBe(channels.adminChannel);
  });

  it("resume histórico cancelado", () => {
    expect(
      buildHistorySummary({
        status: SOS_ALERT_STATUS.cancelled,
        triggeredAt: new Date(),
        resolvedAt: null,
        resolutionNote: null,
        copy: {
          resolvedInMinutes: "Resolvido em {minutos} min",
          resolvedWithNote: "x",
          cancelled: "Cancelado pelo idoso na confirmação",
          open: "Aberto",
        },
      }),
    ).toBe("Cancelado pelo idoso na confirmação");
  });

  it("formata notificação quando existir registro", () => {
    const line = formatNotificationAttemptLine(
      "Marcelo",
      "19:42",
      "WhatsApp",
      "lido",
      "{nome} ({hora}, {canal} · {status})",
    );
    expect(line).toContain("Marcelo");
    expect(line).toContain("lido");
  });
});
