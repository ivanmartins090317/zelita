import { Note } from "@/components/ui/note";
import { landingContent } from "@/content/landing";

function LandingUsability() {
  const { usability } = landingContent;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <h2 className="text-[30px] font-extrabold text-brand-900">
          {usability.title}
        </h2>
        <p className="mb-8 mt-2 max-w-[620px] text-base text-muted">
          {usability.lead}
        </p>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {usability.items.map((item) => (
            <article
              key={item.title}
              className="rounded-card border border-line bg-white p-5 shadow-card"
            >
              <div className="mb-3.5 flex size-icon items-center justify-center rounded-field bg-brand-100 font-head text-body font-extrabold text-brand-700">
                {item.badge}
              </div>
              <h3 className="text-[16.5px] font-bold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-compact text-muted">{item.description}</p>
            </article>
          ))}
        </div>
        <Note icon={usability.note.emoji}>
          <strong>{usability.note.title}</strong> {usability.note.description}
        </Note>
      </div>
    </section>
  );
}

export { LandingUsability };
