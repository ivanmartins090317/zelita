import { landingContent } from "@/content/landing";

function LandingHowItWorks() {
  const { howItWorks } = landingContent;

  return (
    <section
      id={howItWorks.anchorId}
      className="scroll-mt-6 bg-white py-16"
    >
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <h2 className="text-[30px] font-extrabold text-brand-900">
          {howItWorks.title}
        </h2>
        <p className="mb-8 mt-2 max-w-[620px] text-base text-muted">
          {howItWorks.lead}
        </p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorks.steps.map((step) => (
            <article
              key={step.number}
              className="rounded-note border border-line bg-white p-4"
            >
              <div className="font-head text-[26px] font-extrabold leading-none text-brand-200">
                {step.number}
              </div>
              <h3 className="mt-2 text-control font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-compact text-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { LandingHowItWorks };
