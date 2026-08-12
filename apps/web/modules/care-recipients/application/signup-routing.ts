import { signupRoutes } from "@/content/signup";
import {
  isAccountOnboardingComplete,
  type AccountRouteSnapshot,
} from "@/modules/accounts/application/login-routing";

export type SignupOtpOutcome =
  | { kind: "continue"; accountId: string | null }
  | { kind: "already_complete"; accountId: string | null }
  | { kind: "picker" };

/** Pós-OTP no cadastro: wizard continua se onboarding incompleto. */
export function resolveSignupOtpOutcome(
  memberships: AccountRouteSnapshot[],
): SignupOtpOutcome {
  const completeMemberships = memberships.filter((item) =>
    isAccountOnboardingComplete(item),
  );

  if (completeMemberships.length === 0) {
    const accountId =
      memberships.length === 1 ? (memberships[0]?.accountId ?? null) : null;
    return { kind: "continue", accountId };
  }

  if (completeMemberships.length === 1) {
    return {
      kind: "already_complete",
      accountId: completeMemberships[0]?.accountId ?? null,
    };
  }

  return { kind: "picker" };
}

export const SIGNUP_STEP = {
  email: 1,
  code: 2,
  manager: 3,
  careRecipient: 4,
  contact: 5,
  channel: 6,
  invites: 7,
  plan: 8,
} as const;

export type SignupStepNumber =
  (typeof SIGNUP_STEP)[keyof typeof SIGNUP_STEP];

export interface SignupSessionSnapshot {
  isAuthenticated: boolean;
  hasCompleteAccount: boolean;
  pendingEmail?: string | null;
}

/** Passo inicial ao abrir `/cadastro` ou redirect de `/onboarding`. */
export function resolveSignupInitialStep(
  session: SignupSessionSnapshot,
): SignupStepNumber {
  if (session.hasCompleteAccount) {
    return SIGNUP_STEP.email;
  }
  if (session.isAuthenticated) {
    return SIGNUP_STEP.manager;
  }
  if (session.pendingEmail) {
    return SIGNUP_STEP.code;
  }
  return SIGNUP_STEP.email;
}

/** Destino canônico para cadastro incompleto pós-login. */
export function destinationPathForIncompleteSignup(): string {
  return signupRoutes.cadastro;
}

/** Verifica se alguma membership já tem pessoa cuidada (conta completa). */
export function hasAnyCompleteMembership(
  memberships: AccountRouteSnapshot[],
): boolean {
  return memberships.some((item) => isAccountOnboardingComplete(item));
}

/** Nome do passo para o header do wizard. */
export function signupStepLabel(step: SignupStepNumber): string {
  return signupRoutes.stepNames[step - 1] ?? "";
}
