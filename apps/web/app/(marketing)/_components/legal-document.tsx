import Link from "next/link";

import { legalContent, type LegalPageContent } from "@/content/legal";
import { landingRoutes } from "@/content/landing";

import { LandingFooter } from "./landing-footer";
import { LandingNav } from "./landing-nav";

interface LegalDocumentProps {
  page: LegalPageContent;
}

function LegalDocument({ page }: LegalDocumentProps) {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-background">
      <LandingNav />
      <article className="mx-auto w-full max-w-[720px] flex-1 px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-compact text-muted">
          <Link
            href={landingRoutes.home}
            className="inline-flex min-h-[44px] items-center font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            {legalContent.backLabel}
          </Link>
        </p>
        <h1 className="mt-4 font-head text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold leading-tight text-brand-900">
          {page.title}
        </h1>
        <p className="mt-2 text-compact text-muted">
          {page.lastUpdatedLabel} {page.lastUpdated}
        </p>
        <p className="mt-6 text-base leading-relaxed text-ink">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="font-head text-xl font-extrabold text-brand-900">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-3 text-base leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
      <LandingFooter />
    </main>
  );
}

export { LegalDocument };
