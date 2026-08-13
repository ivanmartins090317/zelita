import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  memberHasPanelAccess,
  mergeMatrixWithDefaults,
  resolveDefaultChannels,
} from "./notification-matrix-defaults";
import {
  NOTIFICATION_ALERT_TYPE,
  NOTIFICATION_CHANNEL,
} from "./alert-feed-types";

describe("notification-matrix-defaults", () => {
  it("aplica defaults por papel", () => {
    expect(
      resolveDefaultChannels(
        ACCOUNT_ROLES.admin,
        NOTIFICATION_ALERT_TYPE.sos,
      ),
    ).toEqual([NOTIFICATION_CHANNEL.whatsapp, NOTIFICATION_CHANNEL.call]);

    expect(
      resolveDefaultChannels(
        ACCOUNT_ROLES.caregiver,
        NOTIFICATION_ALERT_TYPE.packRefill,
      ),
    ).toEqual([NOTIFICATION_CHANNEL.email]);
  });

  it("mescla preferências salvas com defaults", () => {
    const matrix = mergeMatrixWithDefaults({
      memberId: "m1",
      role: ACCOUNT_ROLES.admin,
      saved: [
        {
          alertType: NOTIFICATION_ALERT_TYPE.zoneExit,
          channels: [NOTIFICATION_CHANNEL.panel],
        },
      ],
    });

    expect(matrix[NOTIFICATION_ALERT_TYPE.zoneExit]).toEqual([
      NOTIFICATION_CHANNEL.panel,
    ]);
    expect(matrix[NOTIFICATION_ALERT_TYPE.sos]).toContain(
      NOTIFICATION_CHANNEL.whatsapp,
    );
  });

  it("exclui contato só-telefone da tabela", () => {
    expect(
      memberHasPanelAccess({
        profileId: null,
        role: ACCOUNT_ROLES.emergency_contact,
      }),
    ).toBe(false);
    expect(
      memberHasPanelAccess({
        profileId: "p1",
        role: ACCOUNT_ROLES.emergency_contact,
      }),
    ).toBe(true);
  });
});
