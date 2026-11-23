import { Note } from "@/components/ui/note";
import { signupContent } from "@/content/signup";
import { SIGNUP_STEP, type SignupStepNumber } from "@/modules/care-recipients/application/signup-routing";
import { SignupCareRecipientStep } from "@/modules/care-recipients/presentation/signup-care-step";
import { SignupChannelStep } from "@/modules/care-recipients/presentation/signup-channel-step";
import { SignupCodeStep } from "@/modules/care-recipients/presentation/signup-code-step";
import { SignupContactStep } from "@/modules/care-recipients/presentation/signup-contact-step";
import { SignupEmailStep } from "@/modules/care-recipients/presentation/signup-email-step";
import {
  validateCareStep,
  validateChannelStep,
  validateContactStep,
  validateManagerStep,
} from "@/modules/care-recipients/presentation/signup-form-helpers";
import { SignupInvitesStep } from "@/modules/care-recipients/presentation/signup-invites-step";
import { SignupManagerStep } from "@/modules/care-recipients/presentation/signup-manager-step";
import { SignupPlanStep } from "@/modules/care-recipients/presentation/signup-plan-step";
import type {
  SignupCodeUiStep,
  SignupLocalInvite,
  SignupWizardData,
} from "@/modules/care-recipients/presentation/signup-types";

interface SignupStepsProps {
  activeStep: SignupStepNumber;
  step: SignupStepNumber;
  sessionReady: boolean;
  data: SignupWizardData;
  userEmail: string | null;
  codeUiStep: SignupCodeUiStep;
  otpSentAt: number | null;
  verifyErrorMessage?: string;
  isSending: boolean;
  isVerifying: boolean;
  isSubmitting: boolean;
  sendError?: string;
  fieldErrors: Record<string, string>;
  persistError?: string;
  dndError?: string;
  onPatch: (patch: Partial<SignupWizardData>) => void;
  onSetStep: (step: SignupStepNumber) => void;
  onSetFieldErrors: (errors: Record<string, string>) => void;
  onSetDndError: (error: string | undefined) => void;
  onSendEmail: () => void;
  onVerifyCode: () => void;
  onResendCode: () => void;
  onGoToEmail: () => void;
  onAdvance: (from: SignupStepNumber) => void;
  onComplete: () => void;
}

export function SignupSteps(props: SignupStepsProps) {
  const {
    activeStep,
    step,
    sessionReady,
    data,
    userEmail,
    codeUiStep,
    otpSentAt,
    verifyErrorMessage,
    isSending,
    isVerifying,
    isSubmitting,
    sendError,
    fieldErrors,
    persistError,
    dndError,
    onPatch,
    onSetStep,
    onSetFieldErrors,
    onSetDndError,
    onSendEmail,
    onVerifyCode,
    onResendCode,
    onGoToEmail,
    onAdvance,
    onComplete,
  } = props;

  return (
    <>
      {!sessionReady && step > SIGNUP_STEP.code ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {signupContent.validation.sessionRequired}
        </Note>
      ) : null}

      {activeStep === SIGNUP_STEP.email ? (
        <SignupEmailStep
          email={data.email}
          errorMessage={sendError}
          isSending={isSending}
          onEmailChange={(email) => onPatch({ email })}
          onSubmit={onSendEmail}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.code ? (
        <SignupCodeStep
          email={data.email}
          code={data.code}
          uiStep={codeUiStep}
          otpSentAt={otpSentAt}
          errorMessage={verifyErrorMessage}
          isSending={isSending}
          isVerifying={isVerifying}
          onCodeChange={(code) => onPatch({ code })}
          onBack={onGoToEmail}
          onVerify={onVerifyCode}
          onResend={onResendCode}
          onChangeEmail={onGoToEmail}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.manager ? (
        <SignupManagerStep
          managerName={data.managerName}
          managerWhatsapp={data.managerWhatsapp}
          fieldErrors={{
            managerName: fieldErrors.managerName,
            managerWhatsapp: fieldErrors.managerWhatsapp,
          }}
          onManagerNameChange={(managerName) => onPatch({ managerName })}
          onManagerWhatsappChange={(managerWhatsapp) =>
            onPatch({ managerWhatsapp })
          }
          onBack={() => onSetStep(SIGNUP_STEP.code)}
          onContinue={() => {
            const errors = validateManagerStep(data);
            onSetFieldErrors(errors);
            if (Object.keys(errors).length === 0) onAdvance(SIGNUP_STEP.manager);
          }}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.careRecipient ? (
        <SignupCareRecipientStep
          data={data}
          fieldErrors={{
            careFullName: fieldErrors.careFullName,
            careDisplayName: fieldErrors.careDisplayName,
            careBirthDate: fieldErrors.careBirthDate,
          }}
          onChange={onPatch}
          onBack={() => onSetStep(SIGNUP_STEP.manager)}
          onContinue={() => {
            const errors = validateCareStep(data);
            onSetFieldErrors(errors);
            if (Object.keys(errors).length === 0) {
              onAdvance(SIGNUP_STEP.careRecipient);
            }
          }}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.contact ? (
        <SignupContactStep
          careDisplayName={data.careDisplayName}
          careWhatsapp={data.careWhatsapp}
          address={data.address}
          fieldErrors={fieldErrors}
          onCareWhatsappChange={(careWhatsapp) => onPatch({ careWhatsapp })}
          onAddressChange={(patch) =>
            onPatch({ address: { ...data.address, ...patch } })
          }
          onBack={() => onSetStep(SIGNUP_STEP.careRecipient)}
          onContinue={() => {
            const errors = validateContactStep(data);
            onSetFieldErrors(errors);
            if (Object.keys(errors).length === 0) onAdvance(SIGNUP_STEP.contact);
          }}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.channel ? (
        <SignupChannelStep
          data={data}
          dndError={dndError}
          onChange={onPatch}
          onBack={() => onSetStep(SIGNUP_STEP.contact)}
          onContinue={() => {
            const error = validateChannelStep(data);
            if (error) {
              onSetDndError(error);
              return;
            }
            onAdvance(SIGNUP_STEP.channel);
          }}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.invites ? (
        <SignupInvitesStep
          managerName={data.managerName}
          userEmail={data.email || userEmail}
          localInvites={data.localInvites}
          onAddInvite={(invite: SignupLocalInvite) =>
            onPatch({ localInvites: [...data.localInvites, invite] })
          }
          onBack={() => onSetStep(SIGNUP_STEP.channel)}
          onSkip={() => onAdvance(SIGNUP_STEP.invites)}
          onContinue={() => onAdvance(SIGNUP_STEP.invites)}
        />
      ) : null}

      {activeStep === SIGNUP_STEP.plan ? (
        <SignupPlanStep
          planChoice={data.planChoice}
          persistError={persistError}
          isSubmitting={isSubmitting}
          onPlanChange={(planChoice) => onPatch({ planChoice })}
          onBack={() => onSetStep(SIGNUP_STEP.invites)}
          onSubmit={onComplete}
        />
      ) : null}
    </>
  );
}
