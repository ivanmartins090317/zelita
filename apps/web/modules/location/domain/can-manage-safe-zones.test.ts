import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import { canManageSafeZones } from "./can-manage-safe-zones";

describe("canManageSafeZones", () => {
  it("somente administradora", () => {
    expect(canManageSafeZones(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canManageSafeZones(ACCOUNT_ROLES.caregiver)).toBe(false);
    expect(canManageSafeZones(ACCOUNT_ROLES.viewer)).toBe(false);
  });
});
