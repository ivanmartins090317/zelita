import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { LocationHistoryItem } from "@/modules/location/application/get-localizacao-page";

interface LocationHistoryCardProps {
  items: LocationHistoryItem[];
  empty: boolean;
}

function situationToneToTag(
  tone: LocationHistoryItem["situationTone"],
): "ok" | "warning" | "muted" {
  if (tone === "safe") return "ok";
  if (tone === "warning") return "warning";
  return "muted";
}

function LocationHistoryCard({ items, empty }: LocationHistoryCardProps) {
  const copy = familyContent.localizacao.history;

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.title}</CardTitle>
        <Tag tone="muted">{copy.filterTag}</Tag>
      </CardHeader>
      {empty ? (
        <EmptyState
          icon="🕐"
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-secondary">
            <thead>
              <tr className="border-b border-line-2 text-compact uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">{copy.columns.when}</th>
                <th className="px-4 py-3 font-semibold">{copy.columns.where}</th>
                <th className="px-4 py-3 font-semibold">
                  {copy.columns.situation}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line-2 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">
                    {item.whenLabel}
                  </td>
                  <td className="px-4 py-3">{item.whereLabel}</td>
                  <td className="px-4 py-3">
                    <Tag tone={situationToneToTag(item.situationTone)}>
                      {item.situationLabel}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export { LocationHistoryCard };
