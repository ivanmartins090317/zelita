import type { ReactNode } from "react";

function FamilyMark() {
  return (
    <div className="flex items-center gap-2 px-2.5 pb-4 pt-1.5">
      <svg
        width={24}
        height={24}
        viewBox="0 0 48 48"
        aria-hidden="true"
        className="text-brand-on-dark"
      >
        <path
          d="M 38.11 24.64 A 14.8 14.8 0 1 1 14.23 15.46 A 12.8 12.8 0 0 0 38.11 24.64 Z"
          fill="currentColor"
        />
        <circle cx="26.5" cy="16" r="5.6" fill="currentColor" />
      </svg>
      <span className="font-head text-[17px] font-extrabold tracking-tight text-white">
        Zelita
      </span>
    </div>
  );
}

interface FamilyShellLayoutProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  trialBar: ReactNode;
  pausedBanner: ReactNode;
  children: ReactNode;
}

function FamilyShellLayout({
  sidebar,
  topbar,
  trialBar,
  pausedBanner,
  children,
}: FamilyShellLayoutProps) {
  return (
    <div className="flex min-h-full flex-1 bg-sand">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}
        <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
          {trialBar}
          {pausedBanner}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

export { FamilyMark, FamilyShellLayout };
