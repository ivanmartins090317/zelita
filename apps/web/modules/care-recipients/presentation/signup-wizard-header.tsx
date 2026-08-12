import { StepBar } from "@/components/ui/step-bar";
import { signupContent } from "@/content/signup";
import { signupStepLabel } from "@/modules/care-recipients/application/signup-routing";
import type { SignupStepNumber } from "@/modules/care-recipients/application/signup-routing";

interface SignupWizardHeaderProps {
  currentStep: SignupStepNumber;
}

export function SignupWizardHeader({ currentStep }: SignupWizardHeaderProps) {
  const copy = signupContent.shell;

  return (
    <div className="mt-[22px]">
      <div className="flex items-baseline gap-2.5">
        <p className="text-[13px] font-bold tracking-wide text-muted">
          {copy.stepCounterPrefix}{" "}
          <strong className="text-brand-700">{currentStep}</strong>{" "}
          {copy.stepCounterSuffix}
        </p>
        <p className="font-head text-[15px] font-extrabold text-brand-800">
          {signupStepLabel(currentStep)}
        </p>
      </div>
      <StepBar
        total={8}
        current={currentStep}
        className="mb-6 mt-2 gap-[5px]"
      />
    </div>
  );
}
