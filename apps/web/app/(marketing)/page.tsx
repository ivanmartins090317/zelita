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

export default function MarketingHomePage() {
  return (
    <main className="min-h-full flex-1 bg-background">
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
