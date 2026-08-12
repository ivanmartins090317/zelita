import { describe, expect, it } from "vitest";

import {
  ACCOUNT_ROLES,
  canManageMedications,
  canViewCareRoutine,
  computeTrialEndsAt,
  isAccountPaused,
  TRIAL_PLACEHOLDER_DAYS,
} from "./roles";

describe("matriz de papéis", () => {
  it("admin gerencia medicamentos e vê rotina", () => {
    expect(canManageMedications(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canViewCareRoutine(ACCOUNT_ROLES.admin)).toBe(true);
  });

  it("cuidador e visualizador vêem rotina mas não fazem CRUD de cartela", () => {
    expect(canViewCareRoutine(ACCOUNT_ROLES.caregiver)).toBe(true);
    expect(canViewCareRoutine(ACCOUNT_ROLES.viewer)).toBe(true);
    expect(canManageMedications(ACCOUNT_ROLES.caregiver)).toBe(false);
    expect(canManageMedications(ACCOUNT_ROLES.viewer)).toBe(false);
  });

  it("contato de emergência não vê rotina completa de remédios", () => {
    expect(canViewCareRoutine(ACCOUNT_ROLES.emergency_contact)).toBe(false);
    expect(canManageMedications(ACCOUNT_ROLES.emergency_contact)).toBe(false);
  });
});

describe("trial placeholder", () => {
  it("calcula fim do trial em N dias sem cobrança", () => {
    const from = new Date("2026-08-12T12:00:00.000Z");
    const end = computeTrialEndsAt(from);
    const diffDays = Math.round(
      (end.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    expect(diffDays).toBe(TRIAL_PLACEHOLDER_DAYS);
  });

  it("conta pausada ou cancelada bloqueia lembretes", () => {
    expect(isAccountPaused("paused")).toBe(true);
    expect(isAccountPaused("canceled")).toBe(true);
    expect(isAccountPaused("active")).toBe(false);
  });
});
