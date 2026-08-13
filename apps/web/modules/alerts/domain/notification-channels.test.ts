import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  allowedChannelsForMember,
  formatChannelCombinationLabel,
  validateNotificationPreference,
} from "./notification-channels";
import {
  NOTIFICATION_ALERT_TYPE,
  NOTIFICATION_CHANNEL,
} from "./alert-feed-types";

describe("notification-channels", () => {
  it("limita canais por papel", () => {
    expect(
      allowedChannelsForMember(
        ACCOUNT_ROLES.viewer,
        NOTIFICATION_ALERT_TYPE.sos,
      ),
    ).toEqual([NOTIFICATION_CHANNEL.panel]);
    expect(
      allowedChannelsForMember(
        ACCOUNT_ROLES.emergency_contact,
        NOTIFICATION_ALERT_TYPE.sos,
      ),
    ).toContain(NOTIFICATION_CHANNEL.call);
  });

  it("formata combinação legível", () => {
    const label = formatChannelCombinationLabel(
      [NOTIFICATION_CHANNEL.email, NOTIFICATION_CHANNEL.panel],
      {
        panel: "Painel",
        email: "E-mail",
        whatsapp: "WhatsApp",
        call: "ligação",
      },
    );
    expect(label).toBe("E-mail + Painel");
  });

  it("impede desligar SOS para emergência", () => {
    const result = validateNotificationPreference({
      role: ACCOUNT_ROLES.emergency_contact,
      alertType: NOTIFICATION_ALERT_TYPE.sos,
      channels: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("sos_emergency_required");
    }
  });

  it("aceita seleção válida", () => {
    const result = validateNotificationPreference({
      role: ACCOUNT_ROLES.admin,
      alertType: NOTIFICATION_ALERT_TYPE.packRefill,
      channels: [NOTIFICATION_CHANNEL.email],
    });
    expect(result.ok).toBe(true);
  });
});
