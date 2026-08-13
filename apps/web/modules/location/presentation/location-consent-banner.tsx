import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import type { LocalizacaoPageViewModel } from "@/modules/location/application/get-localizacao-page";

interface LocationConsentBannerProps {
  banner: LocalizacaoPageViewModel["consentBanner"];
}

function LocationConsentBanner({ banner }: LocationConsentBannerProps) {
  const copy = familyContent.localizacao.consent;

  return (
    <Note
      icon={banner.tone === "warning" ? "⚠" : "🛡"}
      tone={banner.tone === "warning" ? "warning" : "info"}
      className="mb-5"
    >
      <strong className="text-ink">{banner.title}</strong>
      <p className="mt-1 text-secondary">{banner.body}</p>
      <p className="mt-2 text-compact text-muted">{copy.footer}</p>
    </Note>
  );
}

export { LocationConsentBanner };
