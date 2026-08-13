import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { landingContent, landingRoutes } from "@/content/landing";
import { formatCurrencyBRL } from "@/lib/format";

function LandingPlans() {
  const { plans } = landingContent;

  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-8 sm:px-10">
      <h2 className="text-[30px] font-extrabold text-brand-900">
        {plans.title}
      </h2>
      <p className="mb-8 mt-2 max-w-[620px] text-base text-muted">
        {plans.lead}
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.items.map((plan) => (
          <article
            key={plan.id}
            className={
              plan.highlighted
                ? "relative rounded-card border-2 border-brand-400 bg-white p-6"
                : "relative rounded-card border border-line bg-white p-6"
            }
          >
            {plan.badge ? (
              <Tag tone="info" className="absolute -top-3 left-6">
                {plan.badge}
              </Tag>
            ) : null}
            <span className="inline-block rounded-pill bg-brand-100 px-3 py-1 text-compact font-extrabold text-brand-700">
              {plan.freeTag}
            </span>
            <div className="mt-3 text-[17px] font-extrabold text-ink">
              {plan.name}
            </div>
            <div className="mt-1.5 font-head text-[32px] font-extrabold text-brand-800">
              {formatCurrencyBRL(plan.monthlyPrice)}
              <span className="text-secondary font-semibold text-muted">
                {plans.perMonthSuffix}
              </span>
            </div>
            <div className="text-secondary text-muted">{plan.subtitle}</div>
            <ul className="my-4 space-y-1.5 text-compact text-muted">
              {plan.features.map((feature) => (
                <li
                  key={feature.text}
                  className="relative pl-5 before:absolute before:left-0 before:font-extrabold before:text-brand-500 before:content-['✓']"
                >
                  {feature.emphasized ? (
                    <strong>{feature.text}</strong>
                  ) : (
                    feature.text
                  )}
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={plan.highlighted ? "primary" : "secondary"}
              className="w-full"
            >
              <Link href={landingRoutes.signup}>{plan.cta}</Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

export { LandingPlans };
