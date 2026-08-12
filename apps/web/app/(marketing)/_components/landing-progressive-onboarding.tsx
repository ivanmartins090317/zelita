import { Note } from "@/components/ui/note";
import { landingContent } from "@/content/landing";

function LandingProgressiveOnboarding() {
  const { progressiveOnboarding } = landingContent;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 sm:px-10">
      <h2 className="text-[30px] font-extrabold text-brand-900">
        {progressiveOnboarding.title}
      </h2>
      <p className="mb-8 mt-2 max-w-[620px] text-base text-muted">
        {progressiveOnboarding.lead}
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {progressiveOnboarding.items.map((item) => (
          <article
            key={item.title}
            className={
              item.highlighted
                ? "rounded-card border-2 border-brand-400 bg-white p-5 shadow-card"
                : "rounded-card border border-line bg-white p-5 shadow-card"
            }
          >
            <div
              className={
                item.highlighted
                  ? "mb-3.5 flex size-icon items-center justify-center rounded-field bg-brand-600 font-head text-body font-extrabold text-white"
                  : "mb-3.5 flex size-icon items-center justify-center rounded-field bg-brand-100 font-head text-body font-extrabold text-brand-700"
              }
            >
              {item.badge}
            </div>
            <h3 className="text-[16.5px] font-bold text-ink">{item.title}</h3>
            <p className="mt-1.5 text-compact text-muted">{item.description}</p>
          </article>
        ))}
      </div>
      <Note icon={progressiveOnboarding.note.emoji} className="mt-5">
        <strong>{progressiveOnboarding.note.title}</strong>{" "}
        {progressiveOnboarding.note.description}
      </Note>
    </section>
  );
}

export { LandingProgressiveOnboarding };
