import {
  ACCOUNT_ROLES,
  canManageMedications,
  canViewCareRoutine,
  computeTrialEndsAt,
  isAccountPaused,
  TRIAL_PLACEHOLDER_DAYS,
} from "./domain/roles";
import {
  requestEmailOtp,
  signOut,
  verifyEmailOtp,
} from "./application/auth-actions";
import {
  getFamilyContext,
  requireAdminForMedications,
  requireRoutineViewer,
  requireUser,
} from "./application/family-context";
import { bootstrapFamilyAccount } from "./infrastructure/bootstrap-family-account";

export const accountsModule = {
  id: "accounts",
} as const;

export {
  ACCOUNT_ROLES,
  canManageMedications,
  canViewCareRoutine,
  computeTrialEndsAt,
  isAccountPaused,
  TRIAL_PLACEHOLDER_DAYS,
  requestEmailOtp,
  signOut,
  verifyEmailOtp,
  getFamilyContext,
  requireAdminForMedications,
  requireRoutineViewer,
  requireUser,
  bootstrapFamilyAccount,
};
