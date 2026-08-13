import {
  ACCOUNT_ROLES,
  type AccountRole,
} from "@/modules/accounts/domain/roles";

export function canManageAgenda(role: AccountRole): boolean {
  return (
    role === ACCOUNT_ROLES.admin || role === ACCOUNT_ROLES.caregiver
  );
}

export function canCompleteTask(input: {
  role: AccountRole;
  userId: string;
  assigneeProfileId: string | null;
}): boolean {
  if (canManageAgenda(input.role)) return true;
  return (
    input.assigneeProfileId !== null &&
    input.assigneeProfileId === input.userId
  );
}
