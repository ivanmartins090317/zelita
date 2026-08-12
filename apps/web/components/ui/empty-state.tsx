import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Nenhum estado vazio é só "nada aqui": diz o que vai aparecer ali e traz o
 * botão para preencher.
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-note border border-dashed border-line p-5 text-center",
        className,
      )}
    >
      {icon ? (
        <span aria-hidden className="text-3xl">
          {icon}
        </span>
      ) : null}
      <p className="font-head text-body font-bold text-ink">{title}</p>
      <p className="text-compact text-muted">{description}</p>
      {action}
    </div>
  );
}

export { EmptyState };
