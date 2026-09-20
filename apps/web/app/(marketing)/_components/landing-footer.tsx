import Link from "next/link";

import { landingContent, landingRoutes } from "@/content/landing";

import { LandingMark } from "./landing-mark";

function LandingFooter() {
  const { footer } = landingContent;

  return (
    <footer className="bg-brand-900 px-6 py-10 text-center text-secondary text-on-dark-muted sm:px-10">
      <div className="mb-2 flex justify-center">
        <Link href={landingRoutes.home} aria-label="Zelita — página inicial">
          <LandingMark size="sm" tone="onDark" />
        </Link>
      </div>
      <p className="text-on-dark-muted">{footer.tagline}</p>
      <p className="mt-1 text-compact opacity-85">{footer.subtitle}</p>
      <nav
        aria-label={footer.legalNavLabel}
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        {footer.legalLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-[44px] items-center px-3 text-compact font-semibold text-brand-on-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-on-dark"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mx-auto mt-6 max-w-2xl text-label opacity-75">
        {footer.disclaimer}
      </p>
    </footer>
  );
}

export { LandingFooter };
