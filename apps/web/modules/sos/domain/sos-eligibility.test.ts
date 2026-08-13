import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import {
  canManageSosEscalation,
  canResolveSosAlert,
  canViewSosArea,
  isDefaultEligibleForEscalation,
  isEligibleForEscalation,
  isSosEscalationChecklistComplete,
} from "./sos-eligibility";

describe("sos-eligibility", () => {
  it("elegibilidade padrão exclui visualizador", () => {
    expect(isDefaultEligibleForEscalation(ACCOUNT_ROLES.admin)).toBe(true);
    expect(isDefaultEligibleForEscalation(ACCOUNT_ROLES.caregiver)).toBe(true);
    expect(isDefaultEligibleForEscalation(ACCOUNT_ROLES.emergency_contact)).toBe(
      true,
    );
    expect(isDefaultEligibleForEscalation(ACCOUNT_ROLES.viewer)).toBe(false);
  });

  it("inclui visualizador somente com opt-in explícito", () => {
    expect(
      isEligibleForEscalation(ACCOUNT_ROLES.viewer, false),
    ).toBe(false);
    expect(
      isEligibleForEscalation(ACCOUNT_ROLES.viewer, true),
    ).toBe(true);
  });

  it("acesso à área segue matriz PRD", () => {
    expect(
      canViewSosArea({ role: ACCOUNT_ROLES.admin, isInEscalationOrder: false }),
    ).toBe(true);
    expect(
      canViewSosArea({ role: ACCOUNT_ROLES.viewer, isInEscalationOrder: false }),
    ).toBe(false);
    expect(
      canViewSosArea({ role: ACCOUNT_ROLES.viewer, isInEscalationOrder: true }),
    ).toBe(true);
    expect(canManageSosEscalation(ACCOUNT_ROLES.caregiver)).toBe(false);
    expect(canResolveSosAlert(ACCOUNT_ROLES.caregiver)).toBe(true);
    expect(canResolveSosAlert(ACCOUNT_ROLES.viewer)).toBe(false);
  });

  it("checklist conclui com dois ou mais contatos", () => {
    expect(isSosEscalationChecklistComplete(0)).toBe(false);
    expect(isSosEscalationChecklistComplete(1)).toBe(false);
    expect(isSosEscalationChecklistComplete(2)).toBe(true);
  });
});
