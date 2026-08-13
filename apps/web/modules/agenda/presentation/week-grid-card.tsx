"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";
import type { WeekGridResult } from "@/modules/agenda/domain/week-grid";
import { cn } from "@/lib/utils";

interface WeekGridCardProps {
  title: string;
  grid: WeekGridResult;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

function WeekGridCard({
  title,
  grid,
  onPrevWeek,
  onNextWeek,
}: WeekGridCardProps) {
  const copy = familyContent.consultas.weekGrid;

  return (
    <Card>
      <CardHeader className="flex-wrap gap-3 justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="xs"
            type="button"
            className="min-h-[44px] min-w-[44px] px-3"
            onClick={onPrevWeek}
          >
            {copy.prevWeek}
          </Button>
          <Button
            variant="secondary"
            size="xs"
            type="button"
            className="min-h-[44px] min-w-[44px] px-3"
            onClick={onNextWeek}
          >
            {copy.nextWeek}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] border-collapse text-secondary">
          <thead>
            <tr className="border-b border-line-2">
              <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-compact font-bold uppercase tracking-wide text-muted">
                {copy.timeColumn}
              </th>
              {grid.days.map((day) => (
                <th
                  key={day.dateKey}
                  className={cn(
                    "px-2 py-3 text-center text-compact font-bold uppercase tracking-wide",
                    day.isToday ? "text-brand-700" : "text-muted",
                  )}
                >
                  {day.dayAbbrev} {day.dayNumber}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rows.map((row) => (
              <tr key={row.timeLabel} className="border-b border-line-2 last:border-b-0">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-bold text-ink">
                  {row.timeLabel}
                </td>
                {row.cells.map((cell, index) => {
                  const day = grid.days[index];
                  return (
                    <td key={day?.dateKey ?? index} className="px-2 py-2 align-top">
                      {cell.isEmpty ? (
                        <span className="block text-center text-muted">
                          {copy.emptyCell}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {cell.items.map((item, itemIndex) => (
                            <span
                              key={`${item.kind}-${itemIndex}`}
                              className={cn(
                                "block rounded-full px-2 py-1 text-center text-compact font-semibold",
                                item.kind === "medication" &&
                                  (day?.isToday
                                    ? "bg-brand-100 text-brand-800"
                                    : "bg-gray-100 text-gray-600"),
                                item.kind === "appointment" &&
                                  (day?.isToday
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-gray-100 text-gray-600"),
                              )}
                            >
                              {item.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

export { WeekGridCard };
