/** Papéis da conta — matriz do PRD (sem enum TS). */
export const ACCOUNT_ROLES = {
  admin: "admin",
  caregiver: "caregiver",
  viewer: "viewer",
  emergency_contact: "emergency_contact",
} as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[keyof typeof ACCOUNT_ROLES];

export const ACCOUNT_STATUSES = {
  active: "active",
  paused: "paused",
  canceled: "canceled",
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];

/** Dias de trial placeholder (sem cobrança nesta fatia). */
export const TRIAL_PLACEHOLDER_DAYS = 30;

export function canViewCareRoutine(role: AccountRole): boolean {
  return (
    role === ACCOUNT_ROLES.admin ||
    role === ACCOUNT_ROLES.caregiver ||
    role === ACCOUNT_ROLES.viewer
  );
}

export function canManageMedications(role: AccountRole): boolean {
  return role === ACCOUNT_ROLES.admin;
}

export function canInviteOrChangeRoles(role: AccountRole): boolean {
  return role === ACCOUNT_ROLES.admin;
}

export function canManageBilling(role: AccountRole): boolean {
  return role === ACCOUNT_ROLES.admin;
}

export function computeTrialEndsAt(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setUTCDate(end.getUTCDate() + TRIAL_PLACEHOLDER_DAYS);
  return end;
}

export function isAccountPaused(status: AccountStatus): boolean {
  return status === ACCOUNT_STATUSES.paused || status === ACCOUNT_STATUSES.canceled;
}
