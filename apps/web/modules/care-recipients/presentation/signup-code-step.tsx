"use client";

import { useEffect, useRef } from "react";

import { AccessCodeInput } from "@/components/ui/access-code-input";
import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { signupContent } from "@/content/signup";
import { isValidAccessCodeLength } from "@/lib/format";
import {
  formatResendCountdown,
  computeResendSecondsRemaining,
} from "@/modules/accounts/application/login-routing";
import {
  SignupStepShell,
  SignupStepTitle,
} from "@/modules/care-recipients/presentation/signup-step-shell";
import type { SignupCodeUiStep } from "@/modules/care-recipients/presentation/signup-types";

interface SignupCodeStepProps {
  email: string;
  code: string;
  uiStep: SignupCodeUiStep;
  otpSentAt: number | null;
  errorMessage?: string;
  isSending: boolean;
  isVerifying: boolean;
  onCodeChange: (value: string) => void;
  onBack: () => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

export function SignupCodeStep({
  email,
  code,
  uiStep,
  otpSentAt,
  errorMessage,
  isSending,
  isVerifying,
  onCodeChange,
  onBack,
  onVerify,
  onResend,
  onChangeEmail,
}: SignupCodeStepProps) {
  const copy = signupContent.code;
  const errorCopy = signupContent.codeError;
  const codeInputRef = useRef<HTMLInputElement>(null);
  const resendSeconds = otpSentAt
    ? computeResendSecondsRemaining(
        otpSentAt,
        signupContent.resendCooldownSeconds,
      )
    : 0;

  useEffect(() => {
    codeInputRef.current?.focus();
  }, [uiStep]);

  return (
    <SignupStepShell
      onBack={onBack}
      showContinue={uiStep === "code"}
      onContinue={onVerify}
      continueLabel={
        isVerifying ? copy.submitPendingLabel : copy.submitLabel
      }
      continueDisabled={
        isVerifying || !isValidAccessCodeLength(code.length)
      }
      continuePending={isVerifying}
    >
      <SignupStepTitle
        title={uiStep === "error" ? errorCopy.title : copy.title}
        subtitle={
          uiStep === "error"
            ? errorCopy.subtitle
            : `${copy.subtitlePrefix}${email}${copy.subtitleSuffix}`
        }
      />

      <div className="mb-4">
        <AccessCodeInput
          ref={codeInputRef}
          value={code}
          onChange={onCodeChange}
          tone={uiStep === "error" ? "warning" : "default"}
          pasteLabel={copy.pasteLabel}
          pasteFailedMessage={copy.pasteFailedMessage}
        />
      </div>

      {uiStep === "error" ? (
        <Note tone="warning" icon={errorCopy.alertIcon} className="mb-4">
          <strong>{errorCopy.alertTitle}</strong> {errorCopy.alertBody}
        </Note>
      ) : null}

      {uiStep === "code" ? (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-compact text-muted">
          {resendSeconds > 0 ? (
            <span>
              {copy.resendPrefix}
              <strong className="text-ink">
                {formatResendCountdown(resendSeconds)}
              </strong>
            </span>
          ) : (
            <button
              type="button"
              className="font-bold text-brand-600 underline-offset-2 hover:underline"
              onClick={onResend}
              disabled={isSending}
            >
              {isSending ? copy.resendPendingLabel : copy.resendActionLabel}
            </button>
          )}
          <span className="text-line">·</span>
          <button
            type="button"
            className="font-bold text-brand-600 underline-offset-2 hover:underline"
            onClick={onChangeEmail}
          >
            {copy.changeEmailLabel}
          </button>
        </div>
      ) : null}

      {uiStep === "code" && errorMessage ? (
        <Note tone="warning" icon="⚠️" className="mb-4">
          {errorMessage}
        </Note>
      ) : null}

      {uiStep === "error" ? (
        <div className="space-y-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full"
            disabled={isSending || resendSeconds > 0}
            onClick={onResend}
          >
            {isSending ? errorCopy.resendPendingLabel : errorCopy.resendLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full"
            onClick={onChangeEmail}
          >
            {errorCopy.changeEmailLabel}
          </Button>
        </div>
      ) : null}
    </SignupStepShell>
  );
}
