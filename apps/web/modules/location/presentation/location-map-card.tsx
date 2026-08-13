import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stat } from "@/components/ui/stat";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type {
  LocationMapViewModel,
  LocationStatViewModel,
} from "@/modules/location/application/get-localizacao-page";

interface LocationMapCardProps {
  map: LocationMapViewModel;
  stats: LocationStatViewModel[];
  apelido: string;
  onShareClick?: () => void;
  focusAlert?: boolean;
}

function StaticMapVisual({
  map,
  focusAlert,
}: {
  map: LocationMapViewModel;
  focusAlert?: boolean;
}) {
  if (!map.hasPosition) {
    return (
      <EmptyState
        icon="📍"
        title={map.emptyTitle}
        description={map.emptyDescription}
      />
    );
  }

  return (
    <div
      className={`relative min-h-[220px] overflow-hidden rounded-xl border border-line-2 bg-[linear-gradient(135deg,#e8f0ee_0%,#f5f7f6_50%,#e3ebe8_100%)] ${
        focusAlert ? "ring-2 ring-coral" : ""
      }`}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        aria-hidden
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
      >
        <path d="M0 80 H400 M0 140 H400 M80 0 V220 M160 0 V220 M240 0 V220 M320 0 V220" stroke="#b8cfc8" strokeWidth="1.5" />
        <path d="M0 40 H400 M0 110 H220 M280 110 H400 M0 180 H160 M240 180 H400" stroke="#c9ddd8" strokeWidth="1" />
      </svg>

      {map.pinPosition ? (
        <div
          className="absolute z-10 flex flex-col items-center"
          style={{
            left: `${map.pinPosition.xPct}%`,
            top: `${map.pinPosition.yPct}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="rounded-full border-2 border-dashed border-brand-500/60 px-8 py-8" />
          <div className="mt-1 rounded-lg bg-brand-700 px-2 py-1 text-compact font-semibold text-white shadow-sm">
            {map.pinLabel}
          </div>
        </div>
      ) : null}

      {map.addressOnly ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <p className="rounded-xl bg-white/90 px-4 py-3 text-center font-semibold text-ink shadow-sm">
            {map.addressOnly}
          </p>
        </div>
      ) : null}

      {map.accuracyLabel ? (
        <div className="absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-1 text-compact text-muted">
          {map.accuracyLabel}
        </div>
      ) : null}
    </div>
  );
}

function LocationMapCard({
  map,
  stats,
  onShareClick,
  focusAlert,
}: LocationMapCardProps) {
  const copy = familyContent.localizacao.map;

  return (
    <Card>
      <CardHeader className="flex-wrap justify-between gap-2">
        <CardTitle>{copy.title}</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {map.zoneTag ? (
            <Tag tone={map.zoneTagTone === "safe" ? "ok" : "warning"}>
              {map.zoneTag}
            </Tag>
          ) : null}
          {map.showShareButton && onShareClick ? (
            <Button variant="secondary" size="xs" onClick={onShareClick}>
              {copy.shareQuickButton}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {map.isFrozen ? (
          <p className="rounded-lg border border-amber-line bg-amber-bg px-3 py-2 text-secondary text-amber-ink">
            {copy.frozenHint}
          </p>
        ) : null}

        <StaticMapVisual map={map} focusAlert={focusAlert} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <Stat
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
            />
          ))}
        </div>

        {map.externalMapUrl ? (
          <Button variant="secondary" size="sm" asChild className="min-h-11">
            <Link href={map.externalMapUrl} target="_blank" rel="noreferrer">
              {copy.openExternal}
            </Link>
          </Button>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { LocationMapCard };
