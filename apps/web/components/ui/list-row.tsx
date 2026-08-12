import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ListRowProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

/**
 * Linha de lista do painel: 64 px de altura mínima, divisor entre irmãs e
 * a última sem divisor.
 */
function ListRow({ icon, title, subtitle, trailing, className }: ListRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-row items-center gap-3 border-b border-line-2 px-5 py-4 last:border-b-0 hover:bg-sand",
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden
          className="flex size-icon flex-none items-center justify-center rounded-field bg-brand-50 text-base"
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <div className="truncate text-body font-bold text-ink">{title}</div>
        {subtitle ? (
          <div className="text-secondary text-muted">{subtitle}</div>
        ) : null}
      </div>
      {trailing ? (
        <div className="ml-auto flex flex-none items-center gap-2">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

export { ListRow };
