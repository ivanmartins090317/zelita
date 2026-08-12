import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Etiqueta de status. Cor nunca aparece sozinha: o texto escrito é obrigatório,
 * porque quem não distingue verde de vermelho precisa entender igual.
 */
const tagVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-pill px-3 py-1 text-compact font-bold",
  {
    variants: {
      tone: {
        ok: "bg-ok-bg text-ok",
        warning: "bg-amber-bg text-amber-ink",
        critical: "bg-coral-bg text-coral-dark",
        info: "bg-brand-100 text-brand-700",
        muted: "bg-sand-2 text-muted",
      },
    },
    defaultVariants: {
      tone: "muted",
    },
  },
);

export interface TagProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

function Tag({ className, tone, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone, className }))} {...props} />;
}

export { Tag, tagVariants };
