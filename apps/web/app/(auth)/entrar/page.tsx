import { resolveEntrarPageState } from "@/modules/accounts/application/login-session";
import { LoginForm } from "@/modules/accounts/presentation/login-form";
import { LoginMark } from "@/modules/accounts/presentation/login-mark";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; retorno?: string }>;
}) {
  const params = await searchParams;
  const pageState = await resolveEntrarPageState();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12 sm:py-16">
      <LoginMark />
      <LoginForm
        initialStep={pageState.kind === "account-picker" ? "picker" : "email"}
        initialAccounts={pageState.accounts ?? []}
        urlError={params.erro ?? null}
        returnTo={params.retorno ?? null}
      />
    </main>
  );
}
