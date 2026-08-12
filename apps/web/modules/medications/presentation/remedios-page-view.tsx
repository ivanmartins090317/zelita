"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import type { RemediosPageViewModel } from "@/modules/medications/application/get-remedios-page";
import { PackModal } from "@/modules/medications/presentation/pack-modal";
import { RemediosDetailPanel } from "@/modules/medications/presentation/remedios-detail-panel";
import { RemediosListCard } from "@/modules/medications/presentation/remedios-list-card";
import { RemediosRecentReminders } from "@/modules/medications/presentation/remedios-recent-reminders";

interface RemediosPageViewProps {
  data: RemediosPageViewModel;
}

function RemediosPageView({ data }: RemediosPageViewProps) {
  const copy = familyContent.remedios;
  const router = useRouter();

  const modalMode = data.openModal
    ? "new"
    : data.replacementMedicationId
      ? "replacement"
      : null;

  const selectedMedication = data.medications.find(
    (med) => med.medicationId === data.selectedMedicationId,
  );

  const closeModal = useCallback(() => {
    const href = data.selectedMedicationId
      ? `${familyRoutes.remedios}?remedio=${data.selectedMedicationId}`
      : familyRoutes.remedios;
    router.replace(href);
  }, [router, data.selectedMedicationId]);

  const openNewModal = useCallback(() => {
    router.push(`${familyRoutes.remedios}?modal=nova`);
  }, [router]);

  const openReplacementModal = useCallback(() => {
    if (!data.selectedMedicationId) return;
    router.push(
      `${familyRoutes.remedios}?remedio=${data.selectedMedicationId}&modal=reposicao`,
    );
  }, [data.selectedMedicationId, router]);

  const modalOpen = modalMode !== null;

  return (
    <>
      {data.refillBanner ? (
        <Note icon="⚠️" tone="warning" className="mb-5">
          <strong>{copy.refillBanner.title}</strong> {data.refillBanner.body}
        </Note>
      ) : null}

      <RemediosListCard
        medications={data.medications}
        selectedMedicationId={data.selectedMedicationId}
        canManage={data.canManage}
        isPaused={data.isPaused}
        onAddClick={openNewModal}
      />

      {data.selectedDetail ? (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <RemediosDetailPanel
            detail={data.selectedDetail}
            canManage={data.canManage}
            isPaused={data.isPaused}
            onRegisterPurchase={openReplacementModal}
          />

          <div className="space-y-4">
            <RemediosRecentReminders items={data.recentReminders} />

            <Card>
              <CardHeader>
                <CardTitle>{copy.howWeWrite.title}</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 text-sm">
                <div>
                  <p className="mb-2 font-bold text-ok">{copy.howWeWrite.saysTitle}</p>
                  <div className="flex flex-wrap gap-2">
                    {copy.howWeWrite.saysItems.map((item: string) => (
                      <Tag key={item} tone="ok">
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-bold text-coral-dark">
                    {copy.howWeWrite.neverTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {copy.howWeWrite.neverItems.map((item: string) => (
                      <Tag key={item} tone="muted" className="line-through">
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {!data.canManage ? (
        <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm text-muted">
          {copy.modal.viewerHint}
        </p>
      ) : null}

      {data.canManage && data.isPaused ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {copy.modal.pausedHint}
        </p>
      ) : null}

      {data.canManage ? (
        <PackModal
          key={`${modalMode ?? "closed"}-${selectedMedication?.medicationId ?? "new"}`}
          open={Boolean(modalOpen)}
          mode={modalMode === "replacement" ? "replacement" : "new"}
          careRecipientId={data.careRecipientId}
          replacement={
            modalMode === "replacement" && selectedMedication
              ? {
                  medicationId: selectedMedication.medicationId,
                  name: selectedMedication.name,
                  dosageLabel: selectedMedication.dosageLabel,
                  times: selectedMedication.times,
                  doseUnits: selectedMedication.doseUnits,
                  dosesPerDay: selectedMedication.dosesPerDay,
                }
              : null
          }
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}

export { RemediosPageView };
