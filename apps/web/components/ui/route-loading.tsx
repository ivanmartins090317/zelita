"use client";

/**
 * Texto com brilho na espera entre áreas.
 *
 * O fade, o deslize curto e o brilho no texto adaptam o AITextLoading
 * do kokonutui (MIT). O produto não chama este aviso de inteligência
 * e não usa as frases em inglês do exemplo.
 *
 * @author @dorianbaffier
 * @description AI Text Loading
 * @version 1.0.0
 * @date 2025-06-26
 * @license MIT
 * @website https://kokonutui.com
 * @github https://github.com/kokonut-labs/kokonutui
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  routeLoadingCopy,
  type RouteLoadingVariant,
} from "@/content/route-loading";
import { cn } from "@/lib/utils";

const PHRASE_ENTER_OFFSET_PX = 8;
const SHINE_TRAVEL_SECONDS = 2.5;

const ROUTE_LOADING_CSS = `
@media (prefers-reduced-motion: reduce) {
  .route-loading-phrase {
    transform: none !important;
    background-image: none !important;
    color: var(--brand-900) !important;
    -webkit-text-fill-color: currentColor !important;
    animation: none !important;
    transition: none !important;
  }
}

#elder-app[data-contrast="forte"] .route-loading-phrase {
  background-image: none !important;
  color: currentColor !important;
  -webkit-text-fill-color: currentColor !important;
}
`;

interface RouteLoadingProps {
  variant: RouteLoadingVariant;
}

function RouteLoading({ variant }: RouteLoadingProps) {
  const copy = routeLoadingCopy[variant];
  const prefersReducedMotion = useReducedMotion() === true;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % copy.phrases.length);
    }, copy.intervalMs);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, copy.intervalMs, copy.phrases.length]);

  const visiblePhrase = prefersReducedMotion
    ? copy.anchor
    : copy.phrases[index];

  return (
    <div className="flex w-full items-center justify-center overflow-x-clip px-2 py-10">
      <p className="sr-only" role="status" aria-live="polite">
        {copy.anchor}
      </p>
      <div
        aria-hidden="true"
        className={cn(
          "grid min-h-[2lh] w-full place-items-center",
          variant === "elder"
            ? "font-head text-[length:var(--elder-title,1.5rem)] font-extrabold leading-tight"
            : "font-head text-2xl font-extrabold leading-tight",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={prefersReducedMotion ? "anchor" : index}
            className={cn(
              "route-loading-phrase col-start-1 row-start-1 w-full max-w-full text-center text-balance whitespace-normal",
              prefersReducedMotion
                ? "text-brand-900"
                : "bg-gradient-to-r from-brand-900 via-brand-400 to-brand-900 bg-[length:200%_100%] bg-clip-text text-transparent",
            )}
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, y: PHRASE_ENTER_OFFSET_PX }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : {
                    opacity: 1,
                    y: 0,
                    backgroundPosition: ["200% center", "-200% center"],
                  }
            }
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, y: -PHRASE_ENTER_OFFSET_PX }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.3 },
                    y: { duration: 0.3 },
                    backgroundPosition: {
                      duration: SHINE_TRAVEL_SECONDS,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }
            }
          >
            {visiblePhrase}
          </motion.p>
        </AnimatePresence>
      </div>
      <style>{ROUTE_LOADING_CSS}</style>
    </div>
  );
}

export { RouteLoading };
