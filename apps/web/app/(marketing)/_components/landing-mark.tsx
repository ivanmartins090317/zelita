interface LandingMarkProps {
  size?: "sm" | "md";
  tone?: "brand" | "onDark";
}

function LandingMark({ size = "md", tone = "brand" }: LandingMarkProps) {
  const iconSize = size === "sm" ? 30 : 48;
  const colorClass =
    tone === "onDark" ? "text-white" : "text-brand-800";
  const iconColorClass =
    tone === "onDark" ? "text-brand-on-dark" : "text-brand-600";
  const textClass =
    size === "sm"
      ? `font-head text-xl font-extrabold tracking-tight ${colorClass}`
      : `font-head text-xl font-extrabold tracking-tight sm:text-[1.25rem] ${colorClass}`;

  return (
    <div className={`inline-flex items-center gap-2 ${colorClass}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        aria-hidden="true"
        className={iconColorClass}
      >
        <path
          d="M 38.11 24.64 A 14.8 14.8 0 1 1 14.23 15.46 A 12.8 12.8 0 0 0 38.11 24.64 Z"
          fill="currentColor"
        />
        <circle cx="26.5" cy="16" r="5.6" fill="currentColor" />
      </svg>
      <span className={textClass}>Zelita</span>
    </div>
  );
}

export { LandingMark };
