import { cn } from "@/lib/utils";

export interface StepBarProps {
  total: number;
  current: number;
  label?: string;
  className?: string;
}

/**
 * Barra de passos do cadastro. `current` é 1-based; passos já vencidos e o
 * atual ficam preenchidos.
 */
function StepBar({ total, current, label, className }: StepBarProps) {
  const steps = Array.from({ length: Math.max(total, 0) }, (_, index) => index);
  return (
    <div
      role="group"
      aria-label={label ?? `Passo ${current} de ${total}`}
      className={cn("flex gap-1", className)}
    >
      {steps.map((index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-pill",
            index < current ? "bg-brand-500" : "bg-line",
          )}
        />
      ))}
    </div>
  );
}

export { StepBar };
