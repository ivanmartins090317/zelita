import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import { canViewLocation } from "./can-view-location";

describe("canViewLocation", () => {
  it("permite admin e cuidadora", () => {
    expect(canViewLocation(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canViewLocation(ACCOUNT_ROLES.caregiver)).toBe(true);
  });

  it("nega visualizadora e contato", () => {
    expect(canViewLocation(ACCOUNT_ROLES.viewer)).toBe(false);
    expect(canViewLocation(ACCOUNT_ROLES.emergency_contact)).toBe(false);
  });
});
