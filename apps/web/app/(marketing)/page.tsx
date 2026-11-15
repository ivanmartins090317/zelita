import { redirect } from "next/navigation";

import { buildAuthLinkForwardPath } from "@/modules/accounts/application/email-confirm";

import { LandingComparison } from "./_components/landing-comparison";
import { LandingFooter } from "./_components/landing-footer";
import { LandingFreebar } from "./_components/landing-freebar";
import { LandingHero } from "./_components/landing-hero";
import { LandingHowItWorks } from "./_components/landing-how-it-works";
import { LandingNav } from "./_components/landing-nav";
import { LandingPains } from "./_components/landing-pains";
import { LandingPillars } from "./_components/landing-pillars";
import { LandingPlanGuarantees } from "./_components/landing-plan-guarantees";
import { LandingPlans } from "./_components/landing-plans";
import { LandingProgressiveOnboarding } from "./_components/landing-progressive-onboarding";
import { LandingUsability } from "./_components/landing-usability";
import { MarketingAuthLink } from "./_components/marketing-auth-link";

interface MarketingHomePageProps {
  searchParams: Promise<{
    code?: string;
    token_hash?: string;
    type?: string;
  }>;
}

export default async function MarketingHomePage({
  searchParams,
}: MarketingHomePageProps) {
  const params = await searchParams;
  const forwardPath = buildAuthLinkForwardPath({
    code: params.code ?? null,
    tokenHash: params.token_hash ?? null,
    type: params.type ?? null,
  });
  if (forwardPath) redirect(forwardPath);

  return (
    <main className="min-h-full flex-1 bg-background">
      <MarketingAuthLink />
      <LandingNav />
      <LandingHero />
      <LandingComparison />
      <LandingPillars />
      <div className="space-y-0 py-16">
        <LandingFreebar />
        <LandingPlans />
        <LandingPlanGuarantees />
      </div>
      <LandingUsability />
      <LandingPains />
      <LandingHowItWorks />
      <LandingProgressiveOnboarding />
      <LandingFooter />
    </main>
  );
}
