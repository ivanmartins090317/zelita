import { landingContent } from "@/content/landing";

function LandingPains() {
  const { pains } = landingContent;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-10">
      <h2 className="text-[30px] font-extrabold text-brand-900">{pains.title}</h2>
      <p className="mb-8 mt-2 max-w-[620px] text-base text-muted">{pains.lead}</p>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {pains.items.map((item) => (
          <article
            key={item.quote}
            className="flex gap-3 rounded-note border border-line bg-white p-4 text-secondary"
          >
            <span aria-hidden className="text-xl">
              {item.emoji}
            </span>
            <div>
              <strong className="block text-body text-ink">{item.quote}</strong>
              <span className="text-muted">{item.description}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { LandingPains };
