import { elderContent } from "@/content/elder";
import type { ElderScheduleItem } from "@/modules/elder-access/domain/elder-schedule";
import { elderTitleClass } from "@/modules/elder-access/presentation/elder-classes";
import { ElderScreenTitle } from "@/modules/elder-access/presentation/elder-shell";

interface ElderScheduleListProps {
  items: ElderScheduleItem[];
  loadWarning: string | null;
}

export function ElderScheduleList({ items, loadWarning }: ElderScheduleListProps) {
  const isEmpty = !loadWarning && items.length === 0;

  return (
    <div>
      <ElderScreenTitle
        title={elderContent.schedule.title}
        lead={elderContent.schedule.lead}
      />
      {loadWarning ? (
        <p className="elder-surface rounded-elder border-2 border-line bg-white p-4 text-[length:var(--elder-body)]">
          {loadWarning}
        </p>
      ) : null}
      {isEmpty ? (
        <p className="elder-surface rounded-elder border-2 border-line bg-white p-4 text-[length:var(--elder-body)] font-bold">
          {elderContent.schedule.empty}
        </p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="elder-surface rounded-elder border-2 border-line bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className={elderTitleClass}>{item.timeLabel}</p>
              {item.statusLabel ? (
                <span className="elder-status rounded-pill border border-brand-200 bg-brand-50 px-3 py-1 text-[length:var(--elder-body)] font-bold text-brand-800">
                  {item.statusLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-[length:var(--elder-body)] font-bold">{item.title}</p>
            {item.detail ? (
              <p className="mt-1 text-[length:var(--elder-body)] text-muted">{item.detail}</p>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="elder-surface mt-5 rounded-note bg-sand-2 p-4 text-center text-[length:var(--elder-body)] text-muted">
        {elderContent.schedule.note}
      </p>
    </div>
  );
}
