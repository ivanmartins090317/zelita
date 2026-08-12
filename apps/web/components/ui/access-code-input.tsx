"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
} from "react";

import {
  ACCESS_CODE_MAX_LENGTH,
  normalizeAccessCodeInput,
  toAccessCodeDigits,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export interface AccessCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  tone?: "default" | "warning";
  autoFocus?: boolean;
  "aria-label"?: string;
  className?: string;
}

function resolveCaretIndex(valueLength: number): number | null {
  if (valueLength >= ACCESS_CODE_MAX_LENGTH) return null;
  return valueLength;
}

const AccessCodeInput = forwardRef<HTMLInputElement, AccessCodeInputProps>(
  function AccessCodeInput(
    {
      value,
      onChange,
      tone = "default",
      autoFocus = false,
      "aria-label": ariaLabel = "Código de acesso",
      className,
    },
    ref,
  ) {
    const labelId = useId();
    const internalRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const digits = toAccessCodeDigits(value, ACCESS_CODE_MAX_LENGTH);
    const caretIndex = resolveCaretIndex(value.length);

    function focusInput() {
      const input = internalRef.current;
      input?.focus();
    }

    function cellToneClass(index: number, digit: string) {
      const isActive = isFocused && caretIndex === index;
      const isFilled = Boolean(digit);

      if (tone === "warning") {
        return isFilled
          ? "border-amber-line bg-amber-bg text-amber-ink"
          : isActive
            ? "border-amber-600 bg-amber-bg ring-2 ring-amber-300"
            : "border-line bg-white text-muted-2";
      }

      if (isActive) {
        return "border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-300";
      }

      if (isFilled) {
        return "border-brand-500 bg-brand-50 text-brand-800";
      }

      return "border-line bg-white text-muted-2";
    }

    return (
      <div className={cn("relative", className)}>
        <div
          id={labelId}
          role="group"
          aria-label={ariaLabel}
          onClick={focusInput}
          className={cn(
            "grid grid-cols-4 gap-2 rounded-note p-1 transition-shadow sm:grid-cols-8",
            isFocused && "ring-2 ring-brand-400 ring-offset-2",
          )}
        >
          {digits.map((digit, index) => {
            const isActive = isFocused && caretIndex === index;

            return (
              <span
                key={index}
                aria-hidden
                className={cn(
                  "relative flex h-14 w-full min-w-0 items-center justify-center rounded-control border-2 font-head text-xl font-extrabold sm:h-15 sm:text-2xl",
                  cellToneClass(index, digit),
                )}
              >
                {digit ? (
                  digit
                ) : isActive ? (
                  <span
                    aria-hidden
                    className="block h-7 w-0.5 animate-pulse rounded-full bg-brand-600"
                  />
                ) : (
                  <span className="text-muted-2">_</span>
                )}
              </span>
            );
          })}
        </div>

        <input
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={value}
          onChange={(event) =>
            onChange(normalizeAccessCodeInput(event.target.value))
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          maxLength={ACCESS_CODE_MAX_LENGTH}
          aria-labelledby={labelId}
          aria-label={ariaLabel}
          className="absolute inset-0 cursor-text opacity-0"
        />
      </div>
    );
  },
);

export { AccessCodeInput };
