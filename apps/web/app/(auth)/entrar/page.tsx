import { Suspense } from "react";

import { LoginForm } from "@/modules/accounts/presentation/login-form";

export default function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-extrabold text-brand-900">Entrar</h1>
      <p className="mt-3 text-muted">
        Sem senha. Receba um código de 6 dígitos ou um link mágico no e-mail.
      </p>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando…</p>}>
        <EntrarErro searchParams={searchParams} />
      </Suspense>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}

async function EntrarErro({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const params = await searchParams;
  if (!params.erro) return null;
  return (
    <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
      {params.erro}
    </p>
  );
}
