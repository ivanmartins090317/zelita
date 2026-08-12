"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  completeOnboarding,
  type OnboardingResult,
} from "@/modules/care-recipients/application/complete-onboarding";

const initial: OnboardingResult = { ok: false };

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  hint,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  hint?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-900">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        step={step}
        className="h-12 w-full rounded-xl border border-border bg-white px-4 text-base"
      />
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function OnboardingForm() {
  const [state, action, pending] = useActionState(completeOnboarding, initial);

  return (
    <form action={action} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-brand-900">Sobre você</h2>
        <Field label="Seu nome" name="managerName" required />
        <Field
          label="Seu celular (WhatsApp)"
          name="managerWhatsapp"
          required
          hint="É por aqui que chega pedido de ajuda (SOS na fatia 2)."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-brand-900">Pessoa cuidada</h2>
        <Field label="Nome completo" name="careFullName" required />
        <Field label="Como chamar" name="careDisplayName" required defaultValue="seu João" />
        <Field label="Nascimento" name="careBirthDate" type="date" />
        <Field label="Parentesco" name="careRelationship" defaultValue="Pai" />
        <Field
          label="WhatsApp dele(a)"
          name="careWhatsapp"
          required
          hint="Antes de lembretes, a Zelita pede autorização. Nada recorrente sem opt-in."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-brand-900">Casa e não incomodar</h2>
        <Field label="Endereço de casa" name="addressText" required />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Latitude"
            name="lat"
            type="number"
            step="any"
            required
            defaultValue="-23.5505"
            hint="Fatia 1 já guarda coordenadas."
          />
          <Field
            label="Longitude"
            name="lng"
            type="number"
            step="any"
            required
            defaultValue="-46.6333"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Início do não incomodar"
            name="dndStart"
            type="time"
            required
            defaultValue="22:00"
            hint="Ex.: 22:00 — para de mandar lembrete à noite."
          />
          <Field
            label="Fim do não incomodar"
            name="dndEnd"
            type="time"
            required
            defaultValue="07:00"
            hint="Ex.: 07:00 — retoma de manhã."
          />
        </div>
        <p className="text-sm text-muted">
          Trial de 30 dias fica só como placeholder — sem cartão e sem cobrança
          automática nesta fatia.
        </p>
      </section>

      {state.message ? (
        <p className="text-sm text-red-700">{state.message}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Salvando…" : "Concluir e ir ao painel"}
      </Button>
    </form>
  );
}
