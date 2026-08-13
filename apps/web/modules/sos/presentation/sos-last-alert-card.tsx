"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { SosAlertDetailViewModel } from "@/modules/sos/application/get-pedidos-de-ajuda-page";
import { SOS_ALERT_STATUS } from "@/modules/sos/domain/sos-alert-status";

interface SosLastAlertCardProps {
  alert: SosAlertDetailViewModel | null;
  onResolve: () => void;
}

function DetailField({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string | null;
}) {
  return (
    <div className="border-b border-line-2 py-3 last:border-b-0">
      <div className="text-compact font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 font-semibold text-ink">{value}</div>
      {meta ? <div className="mt-0.5 text-secondary text-muted">{meta}</div> : null}
    </div>
  );
}

function SosLastAlertCard({ alert, onResolve }: SosLastAlertCardProps) {
  const copy = familyContent.pedidosDeAjuda;

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.lastAlert.title}</CardTitle>
        {alert ? (
          <Tag
            tone={
              alert.status === SOS_ALERT_STATUS.open ? "critical" : "muted"
            }
          >
            {alert.statusLabel}
          </Tag>
        ) : null}
      </CardHeader>
      <CardBody>
        {!alert ? (
          <EmptyState
            icon={copy.lastAlert.emptyIcon}
            title={copy.lastAlert.emptyTitle}
            description={copy.lastAlert.emptyDescription}
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-coral-line bg-coral-bg px-4 py-4 font-head text-lg font-extrabold text-on-coral">
              {alert.headline}
            </div>

            <div className="rounded-xl border border-line-2 bg-sand-1 px-4 py-1">
              <DetailField
                label={copy.lastAlert.fields.person}
                value={alert.personLine}
              />
              <DetailField
                label={copy.lastAlert.fields.time}
                value={alert.triggeredAtLabel}
              />
              <DetailField
                label={copy.lastAlert.fields.alertType}
                value={alert.alertTypeLabel}
              />
              <DetailField
                label={copy.lastAlert.fields.location}
                value={alert.locationLine}
                meta={alert.locationMeta}
              />
              <DetailField
                label={copy.lastAlert.fields.callback}
                value={
                  alert.callbackPhone ??
                  copy.detail.callbackUnavailable
                }
              />
              <DetailField
                label={copy.lastAlert.fields.notified}
                value={
                  alert.notifiedLines.length > 0
                    ? alert.notifiedLines.join("\n")
                    : alert.notifiedEmptyCopy
                }
              />
              {alert.outcomeLine ? (
                <DetailField
                  label={copy.lastAlert.fields.outcome}
                  value={alert.outcomeLine}
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {alert.showResolveAction ? (
                <Button variant="emergency" onClick={onResolve}>
                  {copy.lastAlert.resolveButton}
                </Button>
              ) : null}
              <Button variant="secondary" size="sm" disabled title={copy.lastAlert.pdfSoon}>
                {copy.lastAlert.pdfButton}
              </Button>
              {alert.showMapLink ? (
                <Button variant="secondary" size="sm" asChild>
                  <Link href={alert.mapHref}>{copy.lastAlert.mapButton}</Link>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  title={copy.lastAlert.mapDisabledHint}
                >
                  {copy.lastAlert.mapButton}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export { SosLastAlertCard };
