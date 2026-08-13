"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import type { AvisosPageViewModel } from "@/modules/alerts/application/get-avisos-page";
import {
  FEED_PAGE_SIZE,
  type AlertFeedFilter,
} from "@/modules/alerts/domain/alert-feed-types";
import type { AlertFeedItem } from "@/modules/alerts/domain/alert-feed-item";
import { AlertFeedFilters } from "@/modules/alerts/presentation/alert-feed-filters";
import { cn } from "@/lib/utils";

interface AlertFeedCardProps {
  data: Pick<
    AvisosPageViewModel,
    | "feedItems"
    | "activeFilter"
    | "hasMore"
    | "feedEmpty"
    | "filterEmptyCopy"
    | "totalCount"
  >;
}

function resolveStatusTag(item: AlertFeedItem) {
  const copy = familyContent.avisos.feed.status;
  if (item.isResolved) {
    return { label: copy.resolved, tone: "muted" as const };
  }
  if (item.iconTone === "emergency") {
    return { label: copy.open, tone: "critical" as const };
  }
  if (item.iconTone === "warning") {
    return { label: copy.open, tone: "warning" as const };
  }
  return { label: copy.open, tone: "info" as const };
}

function resolveIconClass(tone: AlertFeedItem["iconTone"]): string {
  if (tone === "emergency") return "bg-coral-bg text-coral-dark font-extrabold text-xs";
  if (tone === "warning") return "bg-amber-bg text-amber-ink";
  if (tone === "muted") return "bg-sand-2 text-muted";
  return "bg-brand-50 text-brand-700";
}

function AlertFeedCard({ data }: AlertFeedCardProps) {
  const copy = familyContent.avisos.feed;
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = useCallback(
    (filter: AlertFeedFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === "all") {
        params.delete("filtro");
      } else {
        params.set("filtro", filter);
      }
      params.delete("offset");
      router.push(`${familyRoutes.avisos}?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleLoadMore = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentOffset = Number(params.get("offset") ?? "0");
    params.set("offset", String(currentOffset + FEED_PAGE_SIZE));
    router.push(`${familyRoutes.avisos}?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{copy.cardTitle}</CardTitle>
        <AlertFeedFilters
          activeFilter={data.activeFilter}
          onFilterChange={handleFilterChange}
        />
      </CardHeader>

      {data.feedEmpty ? (
        <CardBody>
          <EmptyState
            icon={copy.emptyIcon}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        </CardBody>
      ) : data.feedItems.length === 0 && data.filterEmptyCopy ? (
        <CardBody>
          <EmptyState
            icon={copy.emptyIcon}
            title={copy.filterEmptyTitle}
            description={data.filterEmptyCopy}
          />
        </CardBody>
      ) : (
        <>
          <div>
            {data.feedItems.map((item) => {
              const status = resolveStatusTag(item);
              return (
                <ListRow
                  key={item.id}
                  icon={
                    <span
                      className={cn(
                        "flex size-icon items-center justify-center rounded-field text-base",
                        resolveIconClass(item.iconTone),
                      )}
                    >
                      {item.icon}
                    </span>
                  }
                  title={item.title}
                  subtitle={item.subtitle}
                  className={item.isResolved ? "opacity-70" : undefined}
                  trailing={
                    <>
                      <Tag tone={status.tone}>{status.label}</Tag>
                      {item.href && item.linkLabel ? (
                        <Button variant="secondary" size="xs" asChild>
                          <Link href={item.href}>{item.linkLabel}</Link>
                        </Button>
                      ) : (
                        <span className="text-compact text-muted">
                          {new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "America/Sao_Paulo",
                          }).format(new Date(item.occurredAt))}
                        </span>
                      )}
                    </>
                  }
                />
              );
            })}
          </div>
          {data.hasMore ? (
            <CardBody className="border-t border-line-2 pt-4">
              <Button variant="secondary" className="w-full" onClick={handleLoadMore}>
                {copy.loadMore}
              </Button>
            </CardBody>
          ) : null}
        </>
      )}
    </Card>
  );
}

export { AlertFeedCard };
