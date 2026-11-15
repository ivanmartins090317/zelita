"use client";

import { Menu, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { registerFamilyGuideMenu } from "@/components/family-guide/family-guide-tour";
import { familyContent } from "@/content/family";

const SIDEBAR_ID = "family-sidebar";

interface FamilyMobileMenuContextValue {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

const FamilyMobileMenuContext =
  createContext<FamilyMobileMenuContextValue | null>(null);

function FamilyMobileMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const openRef = useRef(false);

  const setOpen = useCallback((next: boolean) => {
    openRef.current = next;
    setOpenState(next);
  }, []);

  const toggle = useCallback(() => {
    setOpen(!openRef.current);
  }, [setOpen]);

  useEffect(() => {
    return registerFamilyGuideMenu({
      isOpen: () => openRef.current,
      setOpen,
    });
  }, [setOpen]);

  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 767px)").matches) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <FamilyMobileMenuContext.Provider value={{ open, toggle, setOpen }}>
      {children}
    </FamilyMobileMenuContext.Provider>
  );
}

function useFamilyMobileMenu() {
  const value = useContext(FamilyMobileMenuContext);
  if (!value) {
    throw new Error(
      "O menu do painel precisa ficar dentro de FamilyMobileMenuProvider.",
    );
  }
  return value;
}

function FamilyMobileMenuButton() {
  const { open, toggle } = useFamilyMobileMenu();
  const label = open
    ? familyContent.mobileNav.closeLabel
    : familyContent.mobileNav.openLabel;

  return (
    <button
      type="button"
      className="inline-flex size-tap-sm flex-none items-center justify-center rounded-control-sm bg-brand-800 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 md:hidden"
      aria-expanded={open}
      aria-controls={SIDEBAR_ID}
      aria-label={label}
      onClick={toggle}
    >
      {open ? (
        <X aria-hidden className="size-5" strokeWidth={2} />
      ) : (
        <Menu aria-hidden className="size-5" strokeWidth={2} />
      )}
    </button>
  );
}

export {
  SIDEBAR_ID,
  FamilyMobileMenuButton,
  FamilyMobileMenuProvider,
  useFamilyMobileMenu,
};
