import { cn } from "@/lib/utils";

export type TimelineVariant = "default" | "muted" | "warning";

export interface TimelineItemData {
  id: string;
  timeLabel: string;
  title: string;
  subtitle?: string;
  variant?: TimelineVariant;
  href?: string;
  linkLabel?: string;
}

export interface TimelineProps {
  items: TimelineItemData[];
  className?: string;
}

function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <ol className={cn("space-y-4", className)} aria-label="Linha do tempo do dia">
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "border-l-2 pl-4",
            item.variant === "warning"
              ? "border-amber bg-amber-bg/40 py-2 pr-2"
              : "border-brand-300",
            item.variant === "muted" && "opacity-55",
          )}
        >
          <div className="text-compact font-semibold uppercase tracking-wide text-muted">
            {item.timeLabel}
          </div>
          <div
            className={cn(
              "text-body font-semibold",
              item.variant === "warning" ? "text-amber-ink" : "text-ink",
            )}
          >
            {item.title}
          </div>
          {item.subtitle ? (
            <div className="text-secondary text-muted">{item.subtitle}</div>
          ) : null}
          {item.href && item.linkLabel ? (
            <a
              href={item.href}
              className="mt-1 inline-block text-compact font-bold text-brand-600"
            >
              {item.linkLabel}
            </a>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export { Timeline };
