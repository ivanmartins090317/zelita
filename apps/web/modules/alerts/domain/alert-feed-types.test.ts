import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  ALERT_FEED_FILTER,
  ALERT_FEED_TYPE,
  canViewAlertTypeForRole,
  matchesFeedFilter,
  NOTIFICATION_ALERT_TYPE,
  NOTIFICATION_CHANNEL,
  resolveAlertCategory,
} from "./alert-feed-types";

describe("alert-feed-types", () => {
  it("mapeia tipo para categoria", () => {
    expect(resolveAlertCategory(ALERT_FEED_TYPE.sos)).toBe("emergency");
    expect(resolveAlertCategory(ALERT_FEED_TYPE.invitePending)).toBe("account");
  });

  it("filtra por chip", () => {
    expect(
      matchesFeedFilter(ALERT_FEED_TYPE.sos, ALERT_FEED_FILTER.emergency),
    ).toBe(true);
    expect(
      matchesFeedFilter(ALERT_FEED_TYPE.invitePending, ALERT_FEED_FILTER.medications),
    ).toBe(false);
    expect(
      matchesFeedFilter(ALERT_FEED_TYPE.packRefill, ALERT_FEED_FILTER.all),
    ).toBe(true);
  });

  it("restringe visualizador aos tipos permitidos", () => {
    expect(
      canViewAlertTypeForRole(ACCOUNT_ROLES.viewer, ALERT_FEED_TYPE.packRefill),
    ).toBe(true);
    expect(
      canViewAlertTypeForRole(ACCOUNT_ROLES.viewer, ALERT_FEED_TYPE.sos),
    ).toBe(false);
    expect(
      canViewAlertTypeForRole(ACCOUNT_ROLES.admin, ALERT_FEED_TYPE.sos),
    ).toBe(true);
  });

  it("expõe tipos de matriz e canais", () => {
    expect(Object.keys(NOTIFICATION_ALERT_TYPE)).toHaveLength(4);
    expect(NOTIFICATION_CHANNEL.panel).toBe("panel");
  });
});
