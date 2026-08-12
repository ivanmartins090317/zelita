"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/stat";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { RemediosDetailViewModel } from "@/modules/medications/application/get-remedios-page";
import { pauseMedicationPack } from "@/modules/medications/application/medication-actions";

interface RemediosDetailPanelProps {
  detail: RemediosDetailViewModel;
  canManage: boolean;
  isPaused: boolean;
  onRegisterPurchase: () => void;
}

function RemediosDetailPanel({
  detail,
  canManage,
  isPaused,
  onRegisterPurchase,
}: RemediosDetailPanelProps) {
  const copy = familyContent.remedios.detail;
  const router = useRouter();
  const [isPausing, startPause] = useTransition();

  function handlePause() {
    if (!window.confirm(copy.actions.pauseConfirm)) return;

    startPause(async () => {
      const result = await pauseMedicationPack(detail.packId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>
          {detail.title} {copy.titleSuffix}
        </CardTitle>
        <Tag tone={detail.tagTone}>{detail.tagLabel}</Tag>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            className="shadow-none"
            label={copy.stats.quantityLabel}
            value={Math.round(detail.quantityTotal)}
            hint={copy.stats.quantityHint}
          />
          <Stat
            className="shadow-none"
            label={copy.stats.dailyLabel}
            value={detail.dailyConsumption}
            hint={copy.stats.dailyHint}
          />
          <Stat
            className="shadow-none"
            label={copy.stats.durationLabel}
            value={detail.durationDays}
            hint={copy.stats.durationHint}
          />
          <Stat
            className="shadow-none"
            label={copy.stats.remainingLabel}
            value={detail.daysRemaining}
            hint={copy.stats.remainingHint}
            tone={detail.tagTone === "warning" ? "warning" : "default"}
          />
        </div>

        <div className="mt-4 rounded-xl bg-sand px-4 py-4">
          <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm font-bold text-ink">
            <span>
              {copy.startedLabel.replace("{data}", detail.startDateLabel)}
            </span>
            <span>{copy.endsLabel.replace("{data}", detail.endDateLabel)}</span>
          </div>
          <Progress
            value={detail.progressPercent}
            tone={detail.progressTone}
            label={`Consumo estimado da cartela ${detail.title}`}
          />
          <p className="mt-2 text-sm text-muted">
            {detail.consumedCopy}{" "}
            <strong className="text-ink">{detail.buyUntilLabel}</strong>
          </p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-label font-bold uppercase tracking-wider text-muted">
            {copy.scheduledTitle}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {detail.scheduledAlerts.map((row) => (
                  <tr key={row.id} className="border-b border-line-2 last:border-0">
                    <td className="py-2 pr-3 font-semibold text-ink">{row.label}</td>
                    <td className="py-2 pr-3">
                      <Tag tone={row.statusTone}>{row.statusLabel}</Tag>
                    </td>
                    <td className="py-2 text-right text-muted">{row.recipientCopy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {canManage ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isPaused}
              onClick={onRegisterPurchase}
            >
              {copy.actions.registerPurchase}
            </Button>
            <Button type="button" size="sm" variant="secondary" disabled>
              {copy.actions.editSchedule} · {copy.actions.editScheduleSoon}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isPaused || isPausing}
              onClick={handlePause}
            >
              {isPausing ? "Pausando…" : copy.actions.pause}
            </Button>
          </div>
        ) : null}

        {canManage && isPaused ? (
          <p className="mt-3 text-sm text-muted">
            {familyContent.remedios.pausedActionHint}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { RemediosDetailPanel };
