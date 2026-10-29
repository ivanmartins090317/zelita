import Link from "next/link";

import { elderContent, elderRoutes } from "@/content/elder";
import {
  elderPrimaryTapClass,
  elderTitleClass,
} from "@/modules/elder-access/presentation/elder-classes";

export function ElderInstalledGuide() {
  const copy = elderContent.installed;
  return (
    <div className="flex flex-1 flex-col">
      <h1 className={elderTitleClass}>{copy.title}</h1>
      <p className="mt-3 text-[length:var(--elder-body)] text-muted">{copy.lead}</p>
      <ol className="mt-5 space-y-3">
        {copy.steps.map((step, index) => (
          <li
            key={step}
            className="elder-surface rounded-card border-2 border-line bg-white p-4 text-[length:var(--elder-body)]"
          >
            <span className="font-bold text-brand-700">{index + 1}. </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-[length:var(--elder-body)] text-muted">{copy.help}</p>
      <Link href={elderRoutes.home} className={`${elderPrimaryTapClass} mt-6`}>
        {copy.enter}
      </Link>
    </div>
  );
}
