import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statValueVariants = cva(
  "mt-2 font-head text-2xl font-extrabold tracking-tight",
  {
    variants: {
      tone: {
        default: "text-brand-800",
        warning: "text-amber-ink",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

export interface StatProps extends VariantProps<typeof statValueVariants> {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

/** Indicador numérico do painel: rótulo em caixa alta, número grande, apoio. */
function Stat({ label, value, hint, tone, className }: StatProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-white px-5 py-4 shadow-card",
        className,
      )}
    >
      <div className="text-label font-bold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={statValueVariants({ tone })}>{value}</div>
      {hint ? <div className="text-compact text-muted">{hint}</div> : null}
    </div>
  );
}

export { Stat, statValueVariants };
