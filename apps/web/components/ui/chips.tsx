import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

function Chips({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap gap-2", className)} {...props} />;
}

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/**
 * Opção curta de escolha única (tom da mensagem, plano) ou múltipla (quem pode
 * ver um exame). Alvo de 44 px.
 */
function Chip({ className, selected = false, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-tap-chip items-center rounded-pill border px-4 text-control font-semibold transition-colors",
        selected
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-line bg-white text-ink hover:border-brand-400",
        className,
      )}
      {...props}
    />
  );
}

export { Chips, Chip };
