import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  canEditCareSettings,
  canViewAjustes,
} from "./can-edit-care-settings";

describe("canEditCareSettings", () => {
  it("permite somente administrador", () => {
    expect(canEditCareSettings(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canEditCareSettings(ACCOUNT_ROLES.caregiver)).toBe(false);
    expect(canEditCareSettings(ACCOUNT_ROLES.viewer)).toBe(false);
  });
});

describe("canViewAjustes", () => {
  it("permite admin e cuidador", () => {
    expect(canViewAjustes(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canViewAjustes(ACCOUNT_ROLES.caregiver)).toBe(true);
  });

  it("nega visualizador e contato de emergência", () => {
    expect(canViewAjustes(ACCOUNT_ROLES.viewer)).toBe(false);
    expect(canViewAjustes(ACCOUNT_ROLES.emergency_contact)).toBe(false);
  });
});
