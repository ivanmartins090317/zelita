import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { landingContent, landingRoutes } from "@/content/landing";

function HeroIllustrationCard({
  icon,
  title,
  subtitle,
  tag,
  tagTone,
  emergency = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  tag?: string;
  tagTone?: "warning" | "ok";
  emergency?: boolean;
}) {
  return (
    <Card
      className={
        emergency
          ? "border-coral-line bg-coral-bg shadow-none"
          : "shadow-none"
      }
    >
      <div className="flex items-center gap-3 p-3.5">
        <span
          aria-hidden
          className={
            emergency
              ? "flex size-icon flex-none items-center justify-center rounded-field bg-white text-base"
              : "flex size-icon flex-none items-center justify-center rounded-field bg-brand-100 text-base"
          }
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div
            className={
              emergency
                ? "text-body font-bold text-on-coral"
                : "text-body font-bold text-ink"
            }
          >
            {title}
          </div>
          <div
            className={
              emergency
                ? "text-secondary text-on-coral-muted"
                : "text-secondary text-muted"
            }
          >
            {subtitle}
          </div>
        </div>
        {tag ? (
          <Tag tone={tagTone} className="flex-none">
            {tag}
          </Tag>
        ) : null}
      </div>
    </Card>
  );
}

function LandingHero() {
  const { hero } = landingContent;

  return (
    <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 pb-16 pt-6 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-[70px] lg:pt-10">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-100 px-3.5 py-1.5 text-label font-bold tracking-wide text-brand-700">
          {hero.eyebrow}
        </span>
        <h1 className="mt-4 text-[clamp(2.125rem,4.6vw,3.375rem)] font-extrabold leading-[1.05] text-brand-900">
          {hero.title}
        </h1>
        <p className="mt-4 max-w-[520px] text-[17.5px] leading-relaxed text-muted">
          {hero.subtitle}
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button asChild size="lg">
            <Link href={landingRoutes.signup}>{hero.primaryCta}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href={landingRoutes.howItWorksAnchor}>
              {hero.secondaryCta}
            </Link>
          </Button>
        </div>
        <div className="mt-4 inline-flex w-fit max-w-full items-center gap-2.5 rounded-control bg-brand-100 px-4 py-2.5">
          <span aria-hidden className="text-[19px]">
            {hero.trialNote.emoji}
          </span>
          <span className="text-control font-semibold text-brand-700">
            <strong>{hero.trialNote.highlight}</strong>
            {hero.trialNote.rest}
          </span>
        </div>
        <p className="mt-3 text-secondary text-muted">{hero.footnote}</p>
      </div>

      <div className="rounded-sheet bg-gradient-to-br from-brand-800 to-brand-600 p-6 shadow-card">
        <div className="mb-3 text-compact font-bold uppercase tracking-widest text-brand-200">
          {hero.art.caption}
        </div>
        <div className="space-y-2.5">
          <HeroIllustrationCard
            icon={hero.art.medication.icon}
            title={hero.art.medication.title}
            subtitle={hero.art.medication.subtitle}
            tag={hero.art.medication.tag}
            tagTone="warning"
          />
          <HeroIllustrationCard
            icon={hero.art.location.icon}
            title={hero.art.location.title}
            subtitle={hero.art.location.subtitle}
            tag={hero.art.location.tag}
            tagTone="ok"
          />
          <HeroIllustrationCard
            icon={hero.art.emergency.icon}
            title={hero.art.emergency.title}
            subtitle={hero.art.emergency.subtitle}
            emergency
          />
        </div>
      </div>
    </section>
  );
}

export { LandingHero };
