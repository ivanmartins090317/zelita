import { cn } from "@/lib/utils";
import { ACCESS_CODE_LENGTH, toAccessCodeDigits } from "@/lib/format";

export interface CodeBoxProps {
  value: string;
  length?: number;
  invalid?: boolean;
  className?: string;
}

/**
 * Caixa de conferência do código de acesso. Apresentação pura — a digitação
 * fica no formulário que a consome.
 */
function CodeBox({
  value,
  length = ACCESS_CODE_LENGTH,
  invalid = false,
  className,
}: CodeBoxProps) {
  const digits = toAccessCodeDigits(value, length);
  return (
    <div className={cn("flex gap-2", className)}>
      {digits.map((digit, index) => (
        <span
          key={index}
          className={cn(
            "flex h-15 w-tap items-center justify-center rounded-control border-2 font-head text-2xl font-extrabold",
            invalid
              ? "border-coral bg-coral-bg text-coral-dark"
              : digit
                ? "border-brand-500 bg-brand-50 text-brand-800"
                : "border-line bg-white text-muted-2",
          )}
        >
          {digit || "_"}
        </span>
      ))}
    </div>
  );
}

export { CodeBox };
