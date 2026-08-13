import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  buildEscalationChannelLabel,
  formatNotificationAttemptLine,
  resolveChannelLabel,
  resolveNotificationStatusLabel,
} from "./sos-escalation-labels";

const copy = {
  adminChannel: "Ligação + WhatsApp · imediato",
  caregiverChannel: "WhatsApp · imediato",
  viewerChannel: "WhatsApp · imediato",
  emergencyImmediate: "Ligação + WhatsApp · imediato",
  emergencyDelayed: "Ligação · se ninguém responder em 2 min",
};

describe("sos-escalation-labels", () => {
  it("rótulos por papel", () => {
    expect(
      buildEscalationChannelLabel(ACCOUNT_ROLES.admin, 1, 3, copy),
    ).toBe(copy.adminChannel);
    expect(
      buildEscalationChannelLabel(ACCOUNT_ROLES.caregiver, 2, 3, copy),
    ).toBe(copy.caregiverChannel);
    expect(
      buildEscalationChannelLabel(ACCOUNT_ROLES.viewer, 3, 3, copy),
    ).toBe(copy.viewerChannel);
  });

  it("contato de emergência no fim usa atraso de 2 min", () => {
    expect(
      buildEscalationChannelLabel(ACCOUNT_ROLES.emergency_contact, 4, 4, copy),
    ).toBe(copy.emergencyDelayed);
    expect(
      buildEscalationChannelLabel(ACCOUNT_ROLES.emergency_contact, 2, 4, copy),
    ).toBe(copy.emergencyImmediate);
  });

  it("formata linha de notificado", () => {
    const line = formatNotificationAttemptLine(
      "Cintia",
      "19:42",
      "WhatsApp",
      "lido",
      "{nome} ({hora}, {canal} · {status})",
    );
    expect(line).toBe("Cintia (19:42, WhatsApp · lido)");
  });

  it("resolve rótulos de canal e status", () => {
    expect(resolveChannelLabel("whatsapp")).toBe("WhatsApp");
    expect(resolveNotificationStatusLabel("answered")).toBe("atendida");
  });
});
