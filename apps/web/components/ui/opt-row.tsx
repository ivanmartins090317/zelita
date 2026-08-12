import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface OptRowProps {
  title: ReactNode;
  description?: ReactNode;
  selected?: boolean;
  className?: string;
}

/**
 * Linha de opção selecionável (papel do convidado, forma de pagamento).
 * Apresentação pura: quem controla a seleção é o formulário que a consome.
 */
function OptRow({
  title,
  description,
  selected = false,
  className,
}: OptRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-note border p-4",
        selected ? "border-brand-500 bg-brand-50" : "border-line bg-white",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 size-5 flex-none rounded-pill border-2",
          selected
            ? "border-brand-600 bg-brand-600 shadow-[inset_0_0_0_3px_white]"
            : "border-line",
        )}
      />
      <div className="min-w-0">
        <div className="text-body font-bold text-ink">{title}</div>
        {description ? (
          <div className="text-compact text-muted">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

export { OptRow };
