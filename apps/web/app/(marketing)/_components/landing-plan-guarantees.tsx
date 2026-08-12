import { landingContent } from "@/content/landing";

function LandingPlanGuarantees() {
  const { planGuarantees } = landingContent;

  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-10">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {planGuarantees.items.map((item) => (
          <article
            key={item.title}
            className="flex gap-3 rounded-note border border-line bg-white p-4 text-secondary"
          >
            <span aria-hidden className="text-xl">
              {item.emoji}
            </span>
            <div>
              <strong className="block text-body text-ink">{item.title}</strong>
              <span className="text-muted">{item.description}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { LandingPlanGuarantees };
