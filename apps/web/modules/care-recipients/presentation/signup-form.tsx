"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { signupContent } from "@/content/signup";
import {
  requestEmailOtp,
  verifySignupOtp,
  type AuthActionResult,
  type VerifySignupOtpResult,
} from "@/modules/accounts/application/auth-actions";
import { completeSignup } from "@/modules/care-recipients/application/complete-signup";
import {
  SIGNUP_STEP,
  type SignupStepNumber,
} from "@/modules/care-recipients/application/signup-routing";
import {
  buildSignupPayload,
  nextSignupStep,
  resolveActiveSignupStep,
  validateSignupEmail,
} from "@/modules/care-recipients/presentation/signup-form-helpers";
import { SignupSteps } from "@/modules/care-recipients/presentation/signup-form-steps";
import { SignupWizardHeader } from "@/modules/care-recipients/presentation/signup-wizard-header";
import {
  initialSignupWizardData,
  isSignupStepRequiringSession,
  resolveGuardedSignupStep,
  type SignupCodeUiStep,
  type SignupWizardData,
} from "@/modules/care-recipients/presentation/signup-types";

interface SignupFormProps {
  initialStep: SignupStepNumber;
  isAuthenticated: boolean;
  userEmail: string | null;
}

const authInitial: AuthActionResult = { ok: false };

export function SignupForm({
  initialStep,
  isAuthenticated,
  userEmail,
}: SignupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<SignupStepNumber>(
    resolveGuardedSignupStep(initialStep, isAuthenticated, null),
  );
  const [codeUiStep, setCodeUiStep] = useState<SignupCodeUiStep>("code");
  const [data, setData] = useState<SignupWizardData>(() => ({
    ...initialSignupWizardData,
    email: userEmail ?? "",
  }));
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [sendState, setSendState] = useState<AuthActionResult>(authInitial);
  const [verifyState, setVerifyState] = useState<VerifySignupOtpResult>(
    authInitial,
  );
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(isAuthenticated);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [persistError, setPersistError] = useState<string | undefined>();
  const [dndError, setDndError] = useState<string | undefined>();

  const patchData = useCallback((patch: Partial<SignupWizardData>) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);

  const activeStep = resolveActiveSignupStep(step, sessionReady);

  async function handleSendEmail() {
    const emailError = validateSignupEmail(data.email);
    if (emailError) {
      setSendState({ ok: false, message: emailError });
      return;
    }

    setIsSending(true);
    const formData = new FormData();
    formData.set("email", data.email.trim());
    const result = await requestEmailOtp(sendState, formData);
    setSendState(result);
    if (result.ok) {
      setStep(SIGNUP_STEP.code);
      setCodeUiStep("code");
      setOtpSentAt(Date.now());
      setVerifyState(authInitial);
    }
    setIsSending(false);
  }

  async function handleResendCode() {
    if (isSending || !data.email) return;
    await handleSendEmail();
    setCodeUiStep("code");
  }

  async function handleVerifyCode() {
    setIsVerifying(true);
    const formData = new FormData();
    formData.set("email", data.email.trim());
    formData.set("token", data.code);
    const result = await verifySignupOtp(verifyState, formData);
    setVerifyState(result);

    if (!result.ok && "invalidCode" in result && result.invalidCode) {
      setCodeUiStep("error");
    } else if (result.ok && "continueSignup" in result) {
      setSessionReady(true);
      setStep(SIGNUP_STEP.manager);
      setCodeUiStep("code");
    } else if (result.ok && "signupAlreadyComplete" in result) {
      router.replace("/familia");
    } else if (result.ok && "needsAccountPicker" in result) {
      router.replace("/entrar");
    }

    setIsVerifying(false);
  }

  function goToEmailStep() {
    setStep(SIGNUP_STEP.email);
    setCodeUiStep("code");
    setOtpSentAt(null);
    setVerifyState(authInitial);
  }

  function advance(from: SignupStepNumber) {
    const nextStep = nextSignupStep(from);
    if (!sessionReady && isSignupStepRequiringSession(nextStep)) {
      setPersistError(signupContent.validation.sessionRequired);
      setStep(SIGNUP_STEP.email);
      return;
    }
    setFieldErrors({});
    setPersistError(undefined);
    setDndError(undefined);
    setStep(nextStep);
  }

  async function handleCompleteSignup() {
    setIsSubmitting(true);
    setPersistError(undefined);
    const result = await completeSignup(buildSignupPayload(data));
    if (!result.ok) {
      setPersistError(result.message ?? signupContent.messages.persistFailure);
    }
    setIsSubmitting(false);
  }

  const verifyErrorMessage =
    verifyState.ok === false && "message" in verifyState
      ? verifyState.message
      : sendState.message && !sendState.ok
        ? sendState.message
        : undefined;

  return (
    <div className="w-full">
      <SignupWizardHeader currentStep={activeStep} />

      <SignupSteps
        activeStep={activeStep}
        step={step}
        sessionReady={sessionReady}
        data={data}
        userEmail={userEmail}
        codeUiStep={codeUiStep}
        otpSentAt={otpSentAt}
        verifyErrorMessage={verifyErrorMessage}
        isSending={isSending}
        isVerifying={isVerifying}
        isSubmitting={isSubmitting}
        sendError={sendState.message && !sendState.ok ? sendState.message : undefined}
        fieldErrors={fieldErrors}
        persistError={persistError}
        dndError={dndError}
        onPatch={patchData}
        onSetStep={setStep}
        onSetFieldErrors={setFieldErrors}
        onSetDndError={setDndError}
        onSendEmail={handleSendEmail}
        onVerifyCode={handleVerifyCode}
        onResendCode={handleResendCode}
        onGoToEmail={goToEmailStep}
        onAdvance={advance}
        onComplete={handleCompleteSignup}
      />
    </div>
  );
}
