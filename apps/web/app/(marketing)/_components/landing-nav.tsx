import Link from "next/link";

import { Button } from "@/components/ui/button";
import { landingContent, landingRoutes } from "@/content/landing";

import { LandingMark } from "./landing-mark";

function LandingNav() {
  const { nav } = landingContent;

  return (
    <header className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-6 py-5 sm:px-10">
      <Link href={landingRoutes.home} aria-label="Zelita — página inicial">
        <LandingMark size="sm" />
      </Link>
      <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-2.5">
        <Button asChild variant="secondary" size="sm">
          <Link href={landingRoutes.login}>{nav.loginLabel}</Link>
        </Button>
        <Button asChild size="sm" className="max-sm:px-3 max-sm:text-compact">
          <Link href={landingRoutes.signup}>{nav.signupLabel}</Link>
        </Button>
      </div>
    </header>
  );
}

export { LandingNav };
