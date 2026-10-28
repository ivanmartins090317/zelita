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
  selectLoginAccount,
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
import { getHojeDashboard } from "./application/get-hoje-dashboard";
import { readCareCircleForElderPreview } from "./application/read-care-circle-for-elder-preview";
import {
  computeOnboardingChecklist,
  isFirstAccessMode,
} from "./application/onboarding-checklist";

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
  selectLoginAccount,
  signOut,
  verifyEmailOtp,
  getFamilyContext,
  requireAdminForMedications,
  requireRoutineViewer,
  requireUser,
  bootstrapFamilyAccount,
  getHojeDashboard,
  readCareCircleForElderPreview,
  computeOnboardingChecklist,
  isFirstAccessMode,
};
