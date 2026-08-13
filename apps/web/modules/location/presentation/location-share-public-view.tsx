import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import type { LocationSharePageViewModel } from "@/modules/location/application/get-location-share-page";

interface LocationSharePublicViewProps {
  data: LocationSharePageViewModel;
}

function LocationSharePublicView({ data }: LocationSharePublicViewProps) {
  const copy = familyContent.localizacao.sharePublic;

  if (data.state !== "ready") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12">
        <EmptyState
          icon="🔗"
          title={copy.expiredTitle}
          description={copy.expiredBody}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[720px] flex-1 flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>
            {data.title} · {data.timeLabel}
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="relative min-h-[220px] overflow-hidden rounded-xl border border-line-2 bg-[linear-gradient(135deg,#e8f0ee_0%,#f5f7f6_50%,#e3ebe8_100%)]">
            {data.pinPosition ? (
              <div
                className="absolute z-10 h-4 w-4 rounded-full bg-brand-600 ring-4 ring-brand-200"
                style={{
                  left: `${data.pinPosition.xPct}%`,
                  top: `${data.pinPosition.yPct}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ) : null}
            {data.addressOnly ? (
              <div className="flex h-full min-h-[220px] items-center justify-center p-4">
                <p className="text-center font-semibold">{data.addressOnly}</p>
              </div>
            ) : null}
          </div>
          {data.externalMapUrl ? (
            <Button asChild className="min-h-11 w-full">
              <Link href={data.externalMapUrl} target="_blank" rel="noreferrer">
                {copy.openMap}
              </Link>
            </Button>
          ) : null}
          <p className="text-compact text-muted">{data.privacyNote}</p>
        </CardBody>
      </Card>
    </main>
  );
}

export { LocationSharePublicView };
