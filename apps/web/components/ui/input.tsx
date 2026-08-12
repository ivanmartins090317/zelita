import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Base compartilhada por entrada, seleção e texto longo.
 * `text-base` (16 px) é obrigatório: abaixo disso o iPhone dá zoom sozinho ao
 * focar o campo e a pessoa se perde na tela.
 */
export const controlClassName =
  "w-full min-h-field rounded-field border border-line bg-white px-4 text-base text-ink outline-none transition-colors focus:border-brand-400 disabled:opacity-45";

function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClassName, className)} {...props} />;
}

export { Input };
