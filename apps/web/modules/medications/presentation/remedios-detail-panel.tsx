"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/stat";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import { deleteMedication } from "@/modules/medications/application/delete-medication";
import type { RemediosDetailViewModel } from "@/modules/medications/application/get-remedios-page";
import { pauseMedicationPack } from "@/modules/medications/application/medication-actions";

interface RemediosDetailPanelProps {
  detail: RemediosDetailViewModel;
  canManage: boolean;
  isPaused: boolean;
  onRegisterPurchase: () => void;
  onEditSchedule: () => void;
}

function RemediosDetailPanel({
  detail,
  canManage,
  isPaused,
  onRegisterPurchase,
  onEditSchedule,
}: RemediosDetailPanelProps) {
  const copy = familyContent.remedios.detail;
  const router = useRouter();
  const [isPausing, startPause] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handlePause() {
    if (!window.confirm(copy.actions.pauseConfirm)) return;

    startPause(async () => {
      const result = await pauseMedicationPack(detail.packId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  function openDelete() {
    setDeleteError(null);
    setDeleteOpen(true);
  }

  function closeDelete() {
    if (isDeleting) return;
    setDeleteOpen(false);
    setDeleteError(null);
  }

  function handleDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteMedication(detail.medicationId);
      if (!result.ok) {
        setDeleteError(
          result.message ??
            "Não foi possível apagar agora. Atualize a página e tente de novo.",
        );
        return;
      }
      setDeleteOpen(false);
      router.replace(familyRoutes.remedios);
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
            label={
              detail.daysRemaining < 0
                ? copy.stats.endedLabel
                : copy.stats.remainingLabel
            }
            value={
              detail.daysRemaining < 0
                ? copy.stats.endedValue
                : detail.daysRemaining
            }
            hint={
              detail.daysRemaining < 0
                ? copy.stats.endedHint
                : copy.stats.remainingHint
            }
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
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isPaused}
              onClick={onEditSchedule}
            >
              {copy.actions.editSchedule}
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
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={isPaused || isDeleting}
              onClick={openDelete}
            >
              {copy.actions.delete}
            </Button>
          </div>
        ) : null}

        <Modal
          open={deleteOpen}
          onClose={closeDelete}
          title={copy.actions.deleteTitle}
          className="w-[min(100%,480px)]"
          footer={
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                size="sm"
                disabled={isDeleting}
                onClick={closeDelete}
              >
                {copy.actions.deleteKeep}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? copy.actions.deletePending : copy.actions.deleteConfirm}
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-sm text-ink">
            <p>{copy.actions.deleteLead.replace("{nome}", detail.title)}</p>
            <p>{copy.actions.deleteHistory}</p>
            <p className="text-muted">{copy.actions.deleteDisclaimer}</p>
            {deleteError ? (
              <p className="text-amber-900">{deleteError}</p>
            ) : null}
          </div>
        </Modal>

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
