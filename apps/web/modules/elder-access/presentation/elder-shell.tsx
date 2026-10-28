import type { CSSProperties, ReactNode } from "react";

import { elderContent } from "@/content/elder";
import {
  elderTextMetrics,
  type ElderDisplayPreferences,
} from "@/modules/elder-access/domain/elder-display";
import { ElderPreviewBanner } from "@/modules/elder-access/presentation/elder-preview-banner";
import { ElderTabBar } from "@/modules/elder-access/presentation/elder-tab-bar";

interface ElderShellProps {
  display: ElderDisplayPreferences;
  showPreviewBanner: boolean;
  children: ReactNode;
}

export function ElderShell({ display, showPreviewBanner, children }: ElderShellProps) {
  const metrics = elderTextMetrics(display.text);
  const style = {
    "--elder-body": `${metrics.bodyPx}px`,
    "--elder-title": `${metrics.titlePx}px`,
  } as CSSProperties;

  return (
    <div
      id="elder-app"
      data-contrast={display.contrast}
      style={style}
      className="mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-sand text-ink"
    >
      <style>{ELDER_APP_CSS}</style>
      {showPreviewBanner ? <ElderPreviewBanner /> : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">{children}</div>
      <ElderTabBar />
    </div>
  );
}

const ELDER_APP_CSS = `
#elder-app { font-size: var(--elder-body, 17px); }
#elder-app[data-contrast="forte"] { background: #fff; color: #000; }
#elder-app[data-contrast="forte"] .elder-surface,
#elder-app[data-contrast="forte"] .elder-banner,
#elder-app[data-contrast="forte"] .elder-title,
#elder-app[data-contrast="forte"] .elder-status {
  background: #fff;
  color: #000;
  border-color: #000;
}
#elder-app[data-contrast="forte"] .elder-sos {
  background: var(--coral);
  color: #fff;
  border-color: var(--coral-dark);
}
`;

export function ElderScreenTitle({
  title,
  lead,
}: {
  title: string;
  lead?: string;
}) {
  return (
    <header className="mb-5">
      <p className="text-[length:var(--elder-body)] font-bold text-brand-700">
        {elderContent.brand}
      </p>
      <h1 className="elder-title mt-2 font-head text-[length:var(--elder-title)] font-extrabold leading-tight text-brand-900">
        {title}
      </h1>
      {lead ? (
        <p className="mt-2 text-[length:var(--elder-body)] text-muted">{lead}</p>
      ) : null}
    </header>
  );
}
