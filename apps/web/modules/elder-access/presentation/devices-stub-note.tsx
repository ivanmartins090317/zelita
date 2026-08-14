import Link from "next/link";

import { Note } from "@/components/ui/note";
import { familyRoutes } from "@/content/family";

interface DevicesStubNoteProps {
  title: string;
  body: string;
  guideLinkLabel: string;
}

function DevicesStubNote({ title, body, guideLinkLabel }: DevicesStubNoteProps) {
  return (
    <Note tone="info" icon="📱" className="text-left">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-secondary">{body}</p>
      <Link
        href={familyRoutes.guia}
        className="mt-2 inline-block text-brand-700 underline"
      >
        {guideLinkLabel}
      </Link>
    </Note>
  );
}

export { DevicesStubNote };
