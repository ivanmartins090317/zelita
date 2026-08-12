import { buildReminderPreview } from "@/modules/care-recipients/domain/message-preview";
import type { SignupToneSlug } from "@/modules/care-recipients/domain/signup-options";

interface SignupMessagePreviewProps {
  tone: SignupToneSlug;
  careDisplayName: string;
  managerName: string;
}

export function SignupMessagePreview({
  tone,
  careDisplayName,
  managerName,
}: SignupMessagePreviewProps) {
  const text = buildReminderPreview({ tone, careDisplayName, managerName });

  return (
    <div className="rounded-note bg-[#DCF8C6] px-4 py-3 text-[15px] leading-relaxed text-ink">
      {text}
    </div>
  );
}
