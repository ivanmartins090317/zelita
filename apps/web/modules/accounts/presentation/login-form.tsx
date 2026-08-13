"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { AccessCodeInput } from "@/components/ui/access-code-input";
import { Card, CardBody } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Note } from "@/components/ui/note";
import { loginContent } from "@/content/login";
import {
  requestEmailOtp,
  selectLoginAccount,
  verifyEmailOtp,
  type AuthActionResult,
  type LoginAccountOption,
  type VerifyEmailOtpResult,
} from "@/modules/accounts/application/auth-actions";
import {
  computeResendSecondsRemaining,
  formatResendCountdown,
} from "@/modules/accounts/application/login-routing";
import {
  isValidAccessCodeLength,
  normalizeAccessCodeInput,
} from "@/lib/format";

type LoginStep = "email" | "code" | "error" | "picker" | "help";

interface LoginFormProps {
  initialStep?: LoginStep;
  initialAccounts?: LoginAccountOption[];
  urlError?: string | null;
  returnTo?: string | null;
}

const authInitial: AuthActionResult = { ok: false };

function StepShell({ children }: { children: ReactNode }) {
  return (
    <Card className="mt-6 border-line bg-white shadow-card">
      <CardBody className="p-6 sm:p-7">{children}</CardBody>
    </Card>
  );
}

function StepTitle({
  title,
  subtitle,
  highlight,
}: {
  title: string;
  subtitle?: string;
  highlight?: string;
}) {
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

export function LoginForm({
  initialStep = "email",
  initialAccounts = [],
  urlError = null,
  returnTo = null,
}: LoginFormProps) {
  const copy = loginContent;
  const [step, setStep] = useState<LoginStep>(initialStep);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [accounts, setAccounts] =
    useState<LoginAccountOption[]>(initialAccounts);
  const [otpSentAt, setOtpSentAt] = useState<number | null>(null);
  const [timerTick, setTimerTick] = useState(0);
  const [sendState, setSendState] = useState<AuthActionResult>(authInitial);
  const [verifyState, setVerifyState] = useState<VerifyEmailOtpResult>(
    authInitial,
  );
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const resendSeconds = otpSentAt
    ? computeResendSecondsRemaining(otpSentAt, copy.resendCooldownSeconds)
    : 0;

  const goToEmail = useCallback(() => {
    setStep("email");
    setCode("");
    setOtpSentAt(null);
    setVerifyState(authInitial);
  }, []);

  useEffect(() => {
    if (step === "code" || step === "error") {
      codeInputRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (!otpSentAt) return;
    const timer = window.setInterval(() => {
      setTimerTick((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpSentAt]);

  void timerTick;

  async function submitSendOtp(formData: FormData) {
    setIsSending(true);
    const result = await requestEmailOtp(sendState, formData);
    setSendState(result);
    if (result.ok) {
      setStep("code");
      setOtpSentAt(Date.now());
      setCode("");
      setVerifyState(authInitial);
    }
    setIsSending(false);
  }

  async function handleSendSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitSendOtp(new FormData(event.currentTarget));
  }

  async function handleResend() {
    if (resendSeconds > 0 || isSending || !email) return;
    const formData = new FormData();
    formData.set("email", email);
    await submitSendOtp(formData);
  }

  async function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsVerifying(true);
    const formData = new FormData(event.currentTarget);
    const result = await verifyEmailOtp(verifyState, formData);
    setVerifyState(result);

    if (!result.ok && result.invalidCode) {
      setStep("error");
    } else if (result.ok && "needsAccountPicker" in result) {
      setAccounts(result.accounts);
      setStep("picker");
    }

    setIsVerifying(false);
  }

  async function handleSelectSubmit(
    event: FormEvent<HTMLFormElement>,
    accountId: string,
  ) {
    event.preventDefault();
    setIsSelecting(true);
    const formData = new FormData();
    formData.set("accountId", accountId);
    await selectLoginAccount(authInitial, formData);
    setIsSelecting(false);
  }

  function handleCodeChange(raw: string) {
    setCode(normalizeAccessCodeInput(raw));
  }

  const verifyErrorMessage =
    verifyState.ok === false && "message" in verifyState
      ? verifyState.message
      : undefined;

  return (
    <div className="w-full">
      {urlError ? (
        <Note tone="warning" icon="⚠️" className="mt-4">
          {urlError}
        </Note>
      ) : null}

      {step === "email" ? (
        <StepShell>
          <StepTitle
            title={copy.email.title}
            subtitle={copy.email.subtitle}
            highlight={copy.email.subtitleBold}
          />
          <form onSubmit={handleSendSubmit} className="space-y-4">
            <Field label={copy.email.emailLabel} htmlFor="login-email">
              <Input
                id="login-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.email.emailPlaceholder}
                className="text-[17px]"
              />
            </Field>
            {sendState.message && !sendState.ok ? (
              <Note tone="warning" icon="⚠️">
                {sendState.message}
              </Note>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              disabled={isSending || !email}
            >
              {isSending
                ? copy.email.submitPendingLabel
                : copy.email.submitLabel}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-compact font-bold text-muted">
              {copy.email.dividerLabel}
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <Button asChild variant="secondary" size="md" className="w-full">
            <Link href={copy.email.signupHref}>{copy.email.signupLabel}</Link>
          </Button>

          <Note tone="info" icon={copy.email.passwordNote.icon} className="mt-5">
            <strong>{copy.email.passwordNote.title}</strong>{" "}
            {copy.email.passwordNote.body}
          </Note>

          <p className="mt-4 text-center text-compact text-muted">
            {copy.email.helpPrompt}{" "}
            <button
              type="button"
              className="font-bold text-brand-600 underline-offset-2 hover:underline"
              onClick={() => setStep("help")}
            >
              {copy.email.helpLinkLabel}
            </button>
          </p>
        </StepShell>
      ) : null}

      {step === "code" || step === "error" ? (
        <StepShell>
          <StepTitle
            title={step === "error" ? copy.error.title : copy.code.title}
            subtitle={
              step === "error"
                ? copy.error.subtitle
                : `${copy.code.subtitlePrefix}${email}. O código chega em segundos e vale por 10 minutos.`
            }
          />

          <div className="mb-4">
            <AccessCodeInput
              ref={codeInputRef}
              value={code}
              onChange={handleCodeChange}
              tone={step === "error" ? "warning" : "default"}
            />
          </div>

          {step === "error" ? (
            <Note tone="warning" icon={copy.error.alertIcon} className="mb-4">
              <strong>{copy.error.alertTitle}</strong> {copy.error.alertBody}
            </Note>
          ) : null}

          {step === "code" ? (
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-compact text-muted">
              {resendSeconds > 0 ? (
                <span>
                  {copy.code.resendPrefix}
                  <strong className="text-ink">
                    {formatResendCountdown(resendSeconds)}
                  </strong>
                </span>
              ) : (
                <button
                  type="button"
                  className="font-bold text-brand-600 underline-offset-2 hover:underline"
                  onClick={handleResend}
                  disabled={isSending}
                >
                  {isSending
                    ? copy.code.resendPendingLabel
                    : copy.code.resendActionLabel}
                </button>
              )}
              <span className="text-line">·</span>
              <button
                type="button"
                className="font-bold text-brand-600 underline-offset-2 hover:underline"
                onClick={goToEmail}
              >
                {copy.code.changeEmailLabel}
              </button>
            </div>
          ) : null}

          {step === "code" && verifyErrorMessage ? (
            <Note tone="warning" icon="⚠️" className="mb-4">
              {verifyErrorMessage}
            </Note>
          ) : null}

          {step === "code" ? (
            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="token" value={code} />
              {returnTo ? (
                <input type="hidden" name="returnTo" value={returnTo} />
              ) : null}
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                disabled={isVerifying || !isValidAccessCodeLength(code.length)}
              >
                {isVerifying
                  ? copy.code.submitPendingLabel
                  : copy.code.submitLabel}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={goToEmail}
              >
                {copy.code.backLabel}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                disabled={isSending || resendSeconds > 0}
                onClick={async () => {
                  await handleResend();
                  setStep("code");
                }}
              >
                {isSending
                  ? copy.error.resendPendingLabel
                  : copy.error.resendLabel}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={goToEmail}
              >
                {copy.error.changeEmailLabel}
              </Button>
            </div>
          )}
        </StepShell>
      ) : null}

      {step === "picker" ? (
        <StepShell>
          <StepTitle
            title={copy.picker.title}
            subtitle={copy.picker.subtitle}
          />
          <div className="space-y-3">
            {accounts.map((account) => (
              <form
                key={account.accountId}
                onSubmit={(event) =>
                  handleSelectSubmit(event, account.accountId)
                }
              >
                <button
                  type="submit"
                  disabled={isSelecting}
                  className="flex w-full items-center gap-3 rounded-note border border-line bg-white p-4 text-left transition-colors hover:border-brand-400 hover:bg-brand-50"
                >
                  <span className="flex size-11 flex-none items-center justify-center rounded-pill bg-brand-600 font-head text-sm font-extrabold text-white">
                    {account.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-ink">
                      {account.displayName}
                    </span>
                    <span className="block text-compact text-muted">
                      {account.subtitle}
                    </span>
                  </span>
                </button>
              </form>
            ))}
          </div>
          <Note tone="info" icon={copy.picker.elderNote.icon} className="mt-5">
            {copy.picker.elderNote.body}
            <strong>{copy.picker.elderNote.bodyBold}</strong>
          </Note>
        </StepShell>
      ) : null}

      {step === "help" ? (
        <StepShell>
          <StepTitle title={copy.help.title} subtitle={copy.help.subtitle} />
          <div className="space-y-4">
            {copy.help.items.map((item) => (
              <div
                key={item.question}
                className="border-b border-line-2 pb-4 last:border-b-0 last:pb-0"
              >
                <p className="font-bold text-ink">{item.question}</p>
                <p className="mt-1 text-body leading-relaxed text-muted">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="mt-6 w-full"
            onClick={() => setStep("email")}
          >
            {copy.help.backLabel}
          </Button>
          <p className="mt-4 text-center text-compact text-muted">
            {copy.help.supportPrefix}
            <strong className="text-ink">{copy.help.supportPhone}</strong>
            {copy.help.supportSuffix}
          </p>
        </StepShell>
      ) : null}
    </div>
  );
}
