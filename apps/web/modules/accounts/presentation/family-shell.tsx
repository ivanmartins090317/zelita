import Link from "next/link";

import { signOut } from "@/modules/accounts";

export function FamilyShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">Zelita</p>
          <h1 className="text-2xl font-extrabold text-brand-900">{title}</h1>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-semibold text-muted underline-offset-2 hover:underline"
          >
            Sair
          </button>
        </form>
      </header>
      <nav className="mt-4 flex gap-2">
        <Link
          href="/familia"
          className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800"
        >
          Hoje
        </Link>
        <Link
          href="/familia/remedios"
          className="rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800"
        >
          Remédios
        </Link>
      </nav>
      <div className="mt-6 flex-1">{children}</div>
    </div>
  );
}
