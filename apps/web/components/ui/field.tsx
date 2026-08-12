import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Rótulo sempre visível acima do campo; a explicação vem embaixo, nunca dentro
 * do campo. Placeholder nunca faz papel de rótulo.
 */
function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("mb-4", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-control font-bold text-brand-800"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1.5 text-compact text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-compact font-bold text-coral-dark">{error}</p>
      ) : null}
    </div>
  );
}

export { Field };
