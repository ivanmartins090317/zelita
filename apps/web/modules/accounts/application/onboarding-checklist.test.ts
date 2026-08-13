import { describe, expect, it } from "vitest";

import {
  computeOnboardingChecklist,
  isFirstAccessMode,
} from "./onboarding-checklist";

describe("isFirstAccessMode", () => {
  it("é true sem remédio ativo", () => {
    expect(isFirstAccessMode(0)).toBe(true);
  });

  it("é false com ao menos um remédio", () => {
    expect(isFirstAccessMode(1)).toBe(false);
  });
});

describe("computeOnboardingChecklist", () => {
  it("marca tarefa 1 concluída com remédio ativo", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 1,
      activeMemberCount: 1,
      activeExamCount: 0,
      sosEscalationContactCount: 0,
    });
    expect(result.tasks[0]?.completed).toBe(true);
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(25);
  });

  it("marca tarefa 3 concluída com dois membros ativos", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 0,
      activeMemberCount: 2,
      activeExamCount: 0,
      sosEscalationContactCount: 0,
    });
    expect(result.tasks[2]?.completed).toBe(true);
    expect(result.completedCount).toBe(1);
  });

  it("marca tarefa 4 concluída com ao menos um exame", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 0,
      activeMemberCount: 1,
      activeExamCount: 1,
      sosEscalationContactCount: 0,
    });
    expect(result.tasks[3]?.completed).toBe(true);
  });

  it("marca tarefa 2 concluída com dois contatos na ordem SOS", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 5,
      activeMemberCount: 4,
      activeExamCount: 0,
      sosEscalationContactCount: 2,
    });
    expect(result.tasks[1]?.completed).toBe(true);
    expect(result.completedCount).toBe(3);
    expect(result.progressPercent).toBe(75);
  });

  it("mantém tarefa 2 pendente com um contato na ordem SOS", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 5,
      activeMemberCount: 4,
      activeExamCount: 0,
      sosEscalationContactCount: 1,
    });
    expect(result.tasks[1]?.completed).toBe(false);
  });
});
