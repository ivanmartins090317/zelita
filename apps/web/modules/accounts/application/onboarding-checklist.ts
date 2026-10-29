import { isSosEscalationChecklistComplete } from "@/modules/sos/domain/sos-eligibility";

/** Fuso padrão quando a pessoa cuidada não tem timezone no cadastro (MVP F4.2). */
export const DEFAULT_CARE_TIMEZONE = "America/Sao_Paulo";

export interface OnboardingChecklistInput {
  activeMedicationCount: number;
  activeMemberCount: number;
  activeExamCount: number;
  sosEscalationContactCount: number;
  /** Admin e cuidador veem a tarefa do celular. Os outros papéis ficam nas quatro de sempre. */
  includeDeviceTask?: boolean;
  hasLinkedDevice?: boolean;
}

export interface OnboardingChecklistTask {
  id: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
}

export interface OnboardingChecklistResult {
  tasks: OnboardingChecklistTask[];
  completedCount: number;
  progressPercent: number;
}

export function isFirstAccessMode(activeMedicationCount: number): boolean {
  return activeMedicationCount === 0;
}

export function computeOnboardingChecklist(
  input: OnboardingChecklistInput,
): OnboardingChecklistResult {
  const tasks: OnboardingChecklistTask[] = [
    { id: 1, completed: input.activeMedicationCount >= 1 },
    { id: 2, completed: isSosEscalationChecklistComplete(input.sosEscalationContactCount) },
    { id: 3, completed: input.activeMemberCount >= 2 },
    { id: 4, completed: input.activeExamCount >= 1 },
  ];

  if (input.includeDeviceTask) {
    tasks.push({ id: 5, completed: input.hasLinkedDevice === true });
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return { tasks, completedCount, progressPercent };
}
