import { elderContent } from "@/content/elder";

export function ElderPreviewBanner() {
  return (
      <p className="elder-banner border-b border-amber-line bg-amber-bg px-4 py-3 text-[length:var(--elder-body)] leading-snug text-amber-ink">
      {elderContent.banner}
    </p>
  );
}
