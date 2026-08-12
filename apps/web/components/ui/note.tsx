import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Aviso destacado. `critical` é o único com coral e serve para limite ou risco
 * — o aviso de que a Zelita não substitui o SAMU, e nada mais banal que isso.
 */
const noteVariants = cva(
  "flex gap-3 rounded-note border px-4 py-4 text-body leading-relaxed",
  {
    variants: {
      tone: {
        info: "border-brand-200 bg-brand-50 text-brand-800",
        warning: "border-amber-line bg-amber-bg text-amber-ink",
        critical: "border-coral-line bg-coral-bg text-on-coral",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

export interface NoteProps extends VariantProps<typeof noteVariants> {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

function Note({ icon, children, tone, className }: NoteProps) {
  return (
    <div className={cn(noteVariants({ tone, className }))}>
      {icon ? (
        <span aria-hidden className="flex-none">
          {icon}
        </span>
      ) : null}
      <div>{children}</div>
    </div>
  );
}

export { Note, noteVariants };
