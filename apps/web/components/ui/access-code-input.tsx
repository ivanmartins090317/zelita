"use client";

import {
  forwardRef,
  useId,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
  normalizeAccessCodeInput,
  resolveAccessCodeBoxLength,
  toAccessCodeDigits,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export interface AccessCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  tone?: "default" | "warning";
  autoFocus?: boolean;
  pasteLabel?: string;
  pasteFailedMessage?: string;
  "aria-label"?: string;
  className?: string;
}

const BOX_LENGTH = resolveAccessCodeBoxLength();

function resolveCaretIndex(valueLength: number): number | null {
  if (valueLength >= BOX_LENGTH) return null;
  return valueLength;
}

const AccessCodeInput = forwardRef<HTMLInputElement, AccessCodeInputProps>(
  function AccessCodeInput(
    {
      value,
      onChange,
      tone = "default",
      autoFocus = false,
      pasteLabel,
      pasteFailedMessage,
      "aria-label": ariaLabel = "Código de acesso",
      className,
    },
    ref,
  ) {
    const labelId = useId();
    const hintId = useId();
    const internalRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [pasteHint, setPasteHint] = useState<string | null>(null);
    const digits = toAccessCodeDigits(value, BOX_LENGTH);
    const caretIndex = resolveCaretIndex(value.length);

    function focusInput() {
      const input = internalRef.current;
      input?.focus();
    }

    function applyPastedText(raw: string) {
      const pastedDigits = normalizeAccessCodeInput(raw).slice(0, BOX_LENGTH);
      if (!pastedDigits) {
        setPasteHint(pasteFailedMessage ?? null);
        focusInput();
        return;
      }
      setPasteHint(null);
      onChange(pastedDigits);
    }

    async function handlePasteClick() {
      if (!navigator.clipboard?.readText) {
        setPasteHint(pasteFailedMessage ?? null);
        focusInput();
        return;
      }

      try {
        const text = await navigator.clipboard.readText();
        applyPastedText(text);
      } catch {
        setPasteHint(pasteFailedMessage ?? null);
        focusInput();
      }
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
      <div className={className}>
        <div className="relative">
        <div
          id={labelId}
          role="group"
          aria-label={ariaLabel}
          onClick={focusInput}
          className={cn(
            "grid grid-cols-6 gap-1.5 rounded-note p-1 transition-shadow sm:gap-2",
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
                  "relative flex h-13 w-full min-w-0 items-center justify-center rounded-control border-2 font-head text-xl font-extrabold sm:h-15 sm:text-2xl",
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
          onChange={(event) => {
            setPasteHint(null);
            onChange(
              normalizeAccessCodeInput(event.target.value).slice(0, BOX_LENGTH),
            );
          }}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text");
            const pastedDigits = normalizeAccessCodeInput(text).slice(
              0,
              BOX_LENGTH,
            );
            if (!pastedDigits) return;
            event.preventDefault();
            setPasteHint(null);
            onChange(pastedDigits);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          name="one-time-code"
          aria-labelledby={labelId}
          aria-label={ariaLabel}
          aria-describedby={pasteHint ? hintId : undefined}
          className="absolute inset-0 z-10 h-full w-full cursor-text border-0 bg-transparent p-0 text-[16px] text-transparent caret-transparent outline-none selection:bg-transparent [-webkit-text-fill-color:transparent]"
        />
        </div>
        {pasteLabel ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="mt-3 w-full"
            onClick={() => {
              void handlePasteClick();
            }}
          >
            {pasteLabel}
          </Button>
        ) : null}
        {pasteHint ? (
          <p id={hintId} role="status" className="mt-2 text-compact text-amber-ink">
            {pasteHint}
          </p>
        ) : null}
      </div>
    );
  },
);

export { AccessCodeInput };
