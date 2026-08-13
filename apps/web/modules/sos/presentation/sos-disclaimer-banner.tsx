import { familyContent } from "@/content/family";
import { Note } from "@/components/ui/note";

function SosDisclaimerBanner() {
  const copy = familyContent.pedidosDeAjuda.disclaimer;
  const body = copy.body
    .replace("{samu}", copy.samu)
    .replace("{bombeiros}", copy.bombeiros);

  return (
    <Note tone="critical" icon={copy.icon} className="mb-5">
      <p>{body}</p>
      <p className="mt-2 text-compact opacity-90">{copy.elderNote}</p>
    </Note>
  );
}

export { SosDisclaimerBanner };
