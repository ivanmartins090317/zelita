"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  requestEmailOtp,
  verifyEmailOtp,
  type AuthActionResult,
} from "@/modules/accounts/application/auth-actions";

const initial: AuthActionResult = { ok: false };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [otpState, otpAction, otpPending] = useActionState(
    requestEmailOtp,
    initial,
  );
  const [linkState, linkAction, linkPending] = useActionState(
    requestEmailOtp,
    initial,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyEmailOtp,
    initial,
  );

  const feedback = otpState.message
    ? otpState
    : linkState.message
      ? linkState
      : null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-900">
            Seu e-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-white px-4 text-base"
            placeholder="cintia@email.com"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <form action={otpAction}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="mode" value="otp" />
            <Button type="submit" disabled={otpPending || !email}>
              {otpPending ? "Enviando…" : "Receber código"}
            </Button>
          </form>
          <form action={linkAction}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="mode" value="magiclink" />
            <Button
              type="submit"
              variant="outline"
              disabled={linkPending || !email}
            >
              {linkPending ? "Enviando…" : "Enviar link mágico"}
            </Button>
          </form>
        </div>
        {feedback ? (
          <p
            className={`text-sm ${feedback.ok ? "text-brand-700" : "text-red-700"}`}
          >
            {feedback.message}
          </p>
        ) : null}
      </div>

      <form action={verifyAction} className="space-y-4 border-t border-border pt-8">
        <input type="hidden" name="email" value={email} />
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-900">
            Código de 6 dígitos
          </label>
          <input
            name="token"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            className="h-12 w-full rounded-xl border border-border bg-white px-4 text-base tracking-widest"
            placeholder="000000"
          />
          <p className="mt-2 text-sm text-muted">
            Válido cerca de 10 minutos. Reenvio após 45 s invalida o anterior.
          </p>
        </div>
        <Button type="submit" disabled={verifyPending || !email}>
          {verifyPending ? "Entrando…" : "Entrar"}
        </Button>
        {verifyState.message ? (
          <p className="text-sm text-red-700">{verifyState.message}</p>
        ) : null}
      </form>
    </div>
  );
}
