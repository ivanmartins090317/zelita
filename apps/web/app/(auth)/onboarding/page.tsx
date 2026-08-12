import { redirect } from "next/navigation";

import { getFamilyContext } from "@/modules/accounts";
import { OnboardingForm } from "@/modules/care-recipients/presentation/onboarding-form";

export default async function OnboardingPage() {
  const ctx = await getFamilyContext();
  if (ctx.accountId && ctx.careRecipientId) {
    redirect("/familia");
  }

  return (
    <main className="mx-auto min-h-full w-full max-w-lg flex-1 px-6 py-12">
      <h1 className="text-3xl font-extrabold text-brand-900">Começar</h1>
      <p className="mt-3 text-muted">
        Cadastro curto: você, a pessoa cuidada, a casa e a janela de não
        incomodar. Sem cartão nesta etapa.
      </p>
      <div className="mt-8">
        <OnboardingForm />
      </div>
    </main>
  );
}
