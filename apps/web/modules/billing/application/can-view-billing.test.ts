import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import { canViewBilling } from "./can-view-billing";

describe("canViewBilling", () => {
  it("permite só administradora", () => {
    expect(canViewBilling(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canViewBilling(ACCOUNT_ROLES.caregiver)).toBe(false);
    expect(canViewBilling(ACCOUNT_ROLES.viewer)).toBe(false);
    expect(canViewBilling(ACCOUNT_ROLES.emergency_contact)).toBe(false);
  });
});
