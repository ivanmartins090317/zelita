import Link from "next/link";

import { Button } from "@/components/ui/button";
import { landingContent, landingRoutes } from "@/content/landing";

function LandingFreebar() {
  const { freebar } = landingContent;

  return (
    <section className="mx-auto max-w-[1200px] px-6 sm:px-10">
      <div className="mb-8 flex flex-wrap items-center gap-5 rounded-sheet bg-gradient-to-br from-brand-800 to-brand-600 px-6 py-6 text-white sm:px-7">
        <div className="flex-none rounded-elder bg-white px-4 py-3.5 text-center font-head text-[22px] font-extrabold leading-tight text-brand-700">
          {freebar.badgeLine1}
          <span className="block text-compact uppercase tracking-widest text-brand-600">
            {freebar.badgeLine2}
          </span>
        </div>
        <div className="min-w-[260px] flex-1">
          <h3 className="text-xl font-extrabold">{freebar.title}</h3>
          <p className="mt-1 text-control leading-relaxed text-on-dark-soft">
            {freebar.description}
          </p>
        </div>
        <Button asChild className="flex-none">
          <Link href={landingRoutes.signup}>{freebar.cta}</Link>
        </Button>
      </div>
    </section>
  );
}

export { LandingFreebar };
