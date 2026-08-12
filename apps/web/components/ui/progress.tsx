import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number;
  label: string;
  /** `warning` é o consumo de cartela apertando: verde vira âmbar. */
  tone?: "brand" | "warning";
  className?: string;
}

function Progress({ value, label, tone = "brand", className }: ProgressProps) {
  const percent = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-3 overflow-hidden rounded-pill bg-line", className)}
    >
      <div
        className={cn(
          "h-full rounded-pill",
          tone === "warning"
            ? "bg-gradient-to-r from-brand-500 to-amber"
            : "bg-brand-500",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export { Progress };
