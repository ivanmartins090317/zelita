import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { signupContent } from "@/content/signup";

interface SignupStepShellProps {
  children: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  continuePending?: boolean;
  extraActions?: ReactNode;
  showBack?: boolean;
  showContinue?: boolean;
}

export function SignupStepShell({
  children,
  onBack,
  onContinue,
  continueLabel = signupContent.shell.continueLabel,
  continueDisabled = false,
  continuePending = false,
  extraActions,
  showBack = true,
  showContinue = true,
}: SignupStepShellProps) {
  return (
    <Card className="mt-6 border-line bg-white shadow-card">
      <CardBody className="p-6 sm:p-7">
        {children}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {showBack && onBack ? (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onBack}
            >
              {signupContent.shell.backLabel}
            </Button>
          ) : null}
          <span className="flex-1" />
          {extraActions}
          {showContinue && onContinue ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onContinue}
              disabled={continueDisabled || continuePending}
            >
              {continuePending ? "…" : continueLabel}
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

interface SignupStepTitleProps {
  title: string;
  subtitle?: string;
  highlight?: string;
}

export function SignupStepTitle({
  title,
  subtitle,
  highlight,
}: SignupStepTitleProps) {
  return (
    <div className="mb-5">
      <h2 className="font-head text-2xl font-extrabold text-brand-900">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-body leading-relaxed text-muted">
          {subtitle}
          {highlight ? (
            <strong className="font-bold text-ink">{highlight}</strong>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
