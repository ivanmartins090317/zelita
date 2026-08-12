import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botão do style guide. `emergency` e `sos` são as únicas variações com coral:
 * pedir ajuda e ligar 192. Um primário por tela; um SOS, só no app do idoso.
 * `default`, `outline` e `lg` são apelidos das telas anteriores à F0.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent font-bold transition-colors disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700",
        secondary:
          "border-line bg-white text-brand-800 hover:border-brand-400",
        emergency: "bg-coral text-white hover:bg-coral-dark",
        default: "bg-brand-600 text-white hover:bg-brand-700",
        outline: "border-line bg-white text-brand-800 hover:border-brand-400",
        ghost: "bg-transparent text-brand-800 hover:bg-brand-50",
      },
      size: {
        md: "min-h-tap rounded-control px-5 py-3 text-base",
        sm: "min-h-tap-sm rounded-control-sm px-4 py-2 text-control",
        xs: "min-h-tap-xs rounded-chip px-3 py-2 text-compact",
        elder:
          "min-h-tap-elder w-full justify-start rounded-elder border-2 border-line bg-white px-4 py-4 text-left text-lg",
        sos: "min-h-tap-sos w-full flex-col rounded-sos px-4 py-6 font-head text-2xl font-extrabold leading-tight",
        default: "min-h-tap rounded-control px-5 py-3 text-base",
        lg: "min-h-tap rounded-control px-8 py-3 text-base",
        icon: "size-9 min-h-0 rounded-control-sm p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
