import Link from "next/link";

import { elderContent, elderRoutes } from "@/content/elder";
import { elderTitleClass } from "@/modules/elder-access/presentation/elder-classes";

export function ElderUnlinked() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center bg-sand px-6 py-16 text-ink">
      <p className="text-[17px] font-bold text-brand-700">{elderContent.brand}</p>
      <h1 className={`${elderTitleClass} mt-3`}>{elderContent.unlinked.title}</h1>
      <p className="mt-4 text-[17px] leading-snug text-muted">
        {elderContent.unlinked.body}
      </p>
      <Link
        href={elderRoutes.login}
        className="mt-8 inline-flex min-h-tap-elder items-center justify-center rounded-elder bg-brand-700 px-5 text-[17px] font-bold text-white"
      >
        {elderContent.unlinked.familyLink}
      </Link>
    </main>
  );
}
