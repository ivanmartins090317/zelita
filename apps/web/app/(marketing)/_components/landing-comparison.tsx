import { landingContent } from "@/content/landing";

function ComparisonColumn({
  label,
  rows,
  variant,
}: {
  label: string;
  rows: { label: string; value: string }[];
  variant: "today" | "zelita";
}) {
  const isZelita = variant === "zelita";

  return (
    <div
      className={
        isZelita
          ? "rounded-card bg-brand-800 p-6 text-on-dark-soft"
          : "rounded-card border border-dashed border-line bg-sand p-6"
      }
    >
      <div
        className={
          isZelita
            ? "mb-4 text-compact font-extrabold uppercase tracking-widest text-brand-on-dark"
            : "mb-4 text-compact font-extrabold uppercase tracking-widest text-muted"
        }
      >
        {label}
      </div>
      <div className="space-y-0 text-body leading-loose">
        {rows.map((row) => (
          <p key={row.label}>
            {row.label}{" "}
            <strong className={isZelita ? "text-white" : "text-ink"}>
              {row.value}
            </strong>
          </p>
        ))}
      </div>
    </div>
  );
}

function LandingComparison() {
  const { comparison } = landingContent;

  return (
    <section className="bg-white pt-16">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10">
        <h2 className="text-[30px] font-extrabold text-brand-900">
          {comparison.title}
        </h2>
        <p className="mb-8 mt-2 max-w-[620px] text-base text-muted">
          {comparison.lead}
        </p>
        <div className="mb-11 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ComparisonColumn
            label={comparison.todayLabel}
            rows={comparison.todayRows}
            variant="today"
          />
          <ComparisonColumn
            label={comparison.zelitaLabel}
            rows={comparison.zelitaRows}
            variant="zelita"
          />
        </div>
      </div>
    </section>
  );
}

export { LandingComparison };
