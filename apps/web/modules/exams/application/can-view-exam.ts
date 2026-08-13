import { ACCOUNT_ROLES, type AccountRole } from "@/modules/accounts/domain/roles";

import { canManageExams } from "./can-manage-exams";

export interface ExamVisibilityContext {
  viewerRole: AccountRole;
  viewerProfileId: string;
  authorizedProfileIds: string[];
}

export function canViewExam(
  context: ExamVisibilityContext,
): boolean {
  if (canManageExams(context.viewerRole)) {
    return true;
  }

  if (
    context.viewerRole === ACCOUNT_ROLES.caregiver ||
    context.viewerRole === ACCOUNT_ROLES.viewer
  ) {
    return context.authorizedProfileIds.includes(context.viewerProfileId);
  }

  return false;
}
