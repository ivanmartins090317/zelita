"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  buildFamilyGuideBalloonBody,
  familyGuideBalloon,
  familyGuideSteps,
  familyGuideTargetIds,
  familyGuideTargetSelector,
  selectFamilyGuideSteps,
} from "@/content/family-guide";

const START_EVENT = "zelita:family-guide-start";
const NARROW_SCREEN = "(max-width: 767px)";
const SIDEBAR_ID = "family-sidebar";
const MENU_SETTLE_MS = 240;
const MENU_SETTLE_REDUCED_MS = 48;
const TOOLTIP_CLASS = "family-guide-tooltip";
const LOAD_ERROR =
  "Não foi possível abrir Como usar a Zelita. Recarregue a página e tente de novo.";

interface FamilyGuideMenuController {
  isOpen: () => boolean;
  setOpen: (open: boolean) => void;
}

interface FamilyGuideTourHandle {
  exit: (force?: boolean) => Promise<unknown>;
}

let menuController: FamilyGuideMenuController | null = null;
let activeTour: FamilyGuideTourHandle | null = null;
let session = 0;

function registerFamilyGuideMenu(controller: FamilyGuideMenuController) {
  menuController = controller;
  return () => {
    if (menuController === controller) menuController = null;
  };
}

function startFamilyGuideTour() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(START_EVENT));
}

function isNarrowScreen() {
  return window.matchMedia(NARROW_SCREEN).matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForMenu() {
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
  await wait(prefersReducedMotion() ? MENU_SETTLE_REDUCED_MS : MENU_SETTLE_MS);
}

async function syncMenuForTarget(target: Element, menuWasOpen: boolean) {
  if (!isNarrowScreen() || !menuController) return;

  const inSidebar = Boolean(target.closest(`#${SIDEBAR_ID}`));
  const shouldOpen = inSidebar || menuWasOpen;
  if (menuController.isOpen() === shouldOpen) return;

  menuController.setOpen(shouldOpen);
  await waitForMenu();
}

function restoreMenu(menuWasOpen: boolean) {
  if (!isNarrowScreen() || !menuController) return;
  if (menuController.isOpen() === menuWasOpen) return;
  menuController.setOpen(menuWasOpen);
}

function focusPanel(element: HTMLElement | null) {
  if (!element?.isConnected) return;
  element.focus();
}

async function loadIntro() {
  const [introModule] = await Promise.all([
    import("intro.js"),
    import("intro.js/introjs.css"),
    import("./family-guide.css"),
  ]);
  return introModule.default;
}

function isTourTargetVisible(element: Element) {
  return element instanceof HTMLElement && element.getClientRects().length > 0;
}

function readVisibleSteps() {
  const available = new Set<string>();
  for (const step of familyGuideSteps) {
    const element = document.querySelector(
      familyGuideTargetSelector(step.targetId),
    );
    if (element && isTourTargetVisible(element)) available.add(step.targetId);
  }
  return selectFamilyGuideSteps(available);
}

async function runFamilyGuideTour(): Promise<boolean> {
  const current = ++session;
  const returnFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (activeTour) {
    const previous = activeTour;
    activeTour = null;
    await previous.exit(true);
  }
  if (current !== session) return true;

  const introJs = await loadIntro();
  if (current !== session) return true;

  const steps = readVisibleSteps();
  if (steps.length === 0) return false;

  const menuWasOpen = isNarrowScreen() && Boolean(menuController?.isOpen());
  const tour = introJs.tour();
  activeTour = tour;

  tour.setOptions({
    steps: steps.map((step, index) => ({
      element: familyGuideTargetSelector(step.targetId),
      title: step.title,
      intro: buildFamilyGuideBalloonBody(step, index + 1, steps.length),
      position:
        step.targetId === familyGuideTargetIds.shortcuts ? "bottom" : "right",
    })),
    nextLabel: familyGuideBalloon.next,
    prevLabel: familyGuideBalloon.back,
    skipLabel: familyGuideBalloon.skip,
    doneLabel: familyGuideBalloon.done,
    showStepNumbers: false,
    showBullets: false,
    showProgress: false,
    exitOnEsc: true,
    exitOnOverlayClick: true,
    disableInteraction: true,
    scrollToElement: true,
    scrollTo: "element",
    tooltipClass: TOOLTIP_CLASS,
    tooltipRenderAsHtml: true,
    hidePrev: false,
    nextToDone: true,
    keyboardNavigation: true,
    dontShowAgain: false,
    helperElementPadding: 6,
    overlayOpacity: 0.55,
  });

  tour.onBeforeChange(async (targetElement) => {
    if (current !== session) return false;
    await syncMenuForTarget(targetElement, menuWasOpen);
    return current === session;
  });

  tour.onExit(() => {
    if (activeTour === tour) activeTour = null;
    restoreMenu(menuWasOpen);
    if (current === session) focusPanel(returnFocus);
  });

  await tour.start();
  return true;
}

interface FamilyGuideStartButtonProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

function FamilyGuideStartButton({
  children,
  className,
  variant,
  size,
}: FamilyGuideStartButtonProps) {
  return (
    <Button
      type="button"
      className={className}
      variant={variant}
      size={size}
      onClick={() => startFamilyGuideTour()}
    >
      {children}
    </Button>
  );
}

function FamilyGuideTour() {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    function onStart() {
      setLoadError(false);
      void runFamilyGuideTour()
        .then((opened) => {
          if (!opened) setLoadError(true);
        })
        .catch((error: unknown) => {
          console.error("Como usar a Zelita não abriu.", error);
          setLoadError(true);
        });
    }

    window.addEventListener(START_EVENT, onStart);
    return () => window.removeEventListener(START_EVENT, onStart);
  }, []);

  if (!loadError) return null;

  return (
    <p
      role="alert"
      className="fixed right-4 bottom-4 z-50 max-w-sm rounded-note border border-brand-200 bg-sand px-4 py-3 text-secondary text-brand-900 shadow-card"
    >
      {LOAD_ERROR}
    </p>
  );
}

export {
  FamilyGuideStartButton,
  FamilyGuideTour,
  registerFamilyGuideMenu,
  startFamilyGuideTour,
};
