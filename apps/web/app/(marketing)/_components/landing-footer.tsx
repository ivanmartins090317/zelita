import { landingContent } from "@/content/landing";

import { LandingMark } from "./landing-mark";

function LandingFooter() {
  const { footer } = landingContent;

  return (
    <footer className="bg-brand-900 px-6 py-10 text-center text-secondary text-on-dark-muted sm:px-10">
      <div className="mb-2 flex justify-center">
        <LandingMark size="sm" tone="onDark" />
      </div>
      <p className="text-on-dark-muted">{footer.tagline}</p>
      <p className="mt-1 text-compact opacity-85">{footer.subtitle}</p>
      <p className="mx-auto mt-6 max-w-2xl text-label opacity-75">
        {footer.disclaimer}
      </p>
    </footer>
  );
}

export { LandingFooter };
