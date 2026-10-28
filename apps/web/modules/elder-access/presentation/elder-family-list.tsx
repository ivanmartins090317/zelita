import { elderContent } from "@/content/elder";
import { cn } from "@/lib/utils";
import { SAMU_TEL, type ElderCallRow } from "@/modules/elder-access/domain/elder-call";
import { elderSosClass, elderTapClass } from "@/modules/elder-access/presentation/elder-classes";
import { ElderScreenTitle } from "@/modules/elder-access/presentation/elder-shell";

interface ElderFamilyListProps {
  calls: ElderCallRow[];
}

export function ElderFamilyList({ calls }: ElderFamilyListProps) {
  return (
    <div>
      <ElderScreenTitle title={elderContent.family.title} lead={elderContent.family.lead} />
      <ul className="flex flex-col gap-3">
        {calls.map((call) => (
          <li key={call.id}>
            {call.tel ? (
              <a href={call.tel} className={elderTapClass}>
                <CallBody call={call} />
                <span className="ml-auto" aria-hidden>
                  📞
                </span>
              </a>
            ) : (
              <div className={cn(elderTapClass, "flex-wrap")}>
                <CallBody call={call} />
                <span className="ml-auto text-[length:var(--elder-body)] font-bold text-muted">
                  {elderContent.family.noPhone}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="my-5 border-t border-line" />
      <a href={SAMU_TEL} className={cn(elderSosClass, "flex-row items-center text-left")}>
        <span aria-hidden>🚑</span>
        <span>
          <span className="block">{elderContent.family.samuTitle}</span>
          <span className="mt-1 block font-sans text-[length:var(--elder-body)] font-medium text-white">
            {elderContent.family.samuDetail}
          </span>
        </span>
      </a>
    </div>
  );
}

function CallBody({ call }: { call: ElderCallRow }) {
  return (
    <span>
      <span className="block">{call.name}</span>
      <span className="mt-1 block font-medium text-muted">{call.kinship}</span>
    </span>
  );
}
