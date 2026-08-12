import Link from "next/link";

import { Button } from "@/components/ui/button";

function ZelitaMark() {
  return (
    <div className="inline-flex items-center gap-3 text-brand-800">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="text-brand-600"
      >
        <path
          d="M 38.11 24.64 A 14.8 14.8 0 1 1 14.23 15.46 A 12.8 12.8 0 0 0 38.11 24.64 Z"
          fill="currentColor"
        />
        <circle cx="26.5" cy="16" r="5.6" fill="currentColor" />
      </svg>
      <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Zelita
      </span>
    </div>
  );
}

export default function MarketingHomePage() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--brand-50),_transparent_55%),linear-gradient(180deg,_var(--surface)_0%,_var(--background)_45%)]"
      />
      <section className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:px-8">
        <ZelitaMark />
        <h1 className="mt-8 max-w-xl text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          Cuide de quem você ama, mesmo à distância.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          Coordenação familiar para o cuidado de idosos — lembretes, SOS e
          rotina no mesmo lugar. Scaffold do monorepo pronto para a fatia 1.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/entrar">Começar</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/familia">Painel da família</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
