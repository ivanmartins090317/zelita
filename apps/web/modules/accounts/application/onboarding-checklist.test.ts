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
    });
    expect(result.tasks[0]?.completed).toBe(true);
    expect(result.completedCount).toBe(1);
    expect(result.progressPercent).toBe(25);
  });

  it("marca tarefa 3 concluída com dois membros ativos", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 0,
      activeMemberCount: 2,
    });
    expect(result.tasks[2]?.completed).toBe(true);
    expect(result.completedCount).toBe(1);
  });

  it("nunca conclui tarefas 2 e 4 no MVP F4.2", () => {
    const result = computeOnboardingChecklist({
      activeMedicationCount: 5,
      activeMemberCount: 4,
    });
    expect(result.tasks[1]?.completed).toBe(false);
    expect(result.tasks[3]?.completed).toBe(false);
    expect(result.completedCount).toBe(2);
    expect(result.progressPercent).toBe(50);
  });
});
