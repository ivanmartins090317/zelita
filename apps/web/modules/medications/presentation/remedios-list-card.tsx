"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { familyContent, familyRoutes } from "@/content/family";
import type { RemediosListItemDisplay } from "@/modules/medications/domain/remedios-display";

interface RemediosListCardProps {
  medications: RemediosListItemDisplay[];
  selectedMedicationId: string | null;
  canManage: boolean;
  isPaused: boolean;
  onAddClick: () => void;
}

function buildRemedioHref(medicationId: string): string {
  return `${familyRoutes.remedios}?remedio=${medicationId}`;
}

function RemediosListCard({
  medications,
  selectedMedicationId,
  canManage,
  isPaused,
  onAddClick,
}: RemediosListCardProps) {
  const copy = familyContent.remedios;

  if (medications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{copy.listCard.title}</CardTitle>
        </CardHeader>
        <CardBody>
          <EmptyState
            icon={copy.empty.icon}
            title={copy.empty.title}
            description={copy.empty.description}
            action={
              canManage && !isPaused ? (
                <Button type="button" onClick={onAddClick}>
                  {copy.empty.cta}
                </Button>
              ) : undefined
            }
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.listCard.title}</CardTitle>
        {canManage ? (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            disabled={isPaused}
            onClick={onAddClick}
          >
            {copy.listCard.addButton}
          </Button>
        ) : null}
      </CardHeader>
      <CardBody className="p-0">
        {medications.map((med) => (
          <ListRow
            key={med.medicationId}
            icon="💊"
            title={med.title}
            subtitle={med.subtitle}
            trailing={
              <>
                <Tag tone={med.tagTone}>{med.tagLabel}</Tag>
                <Button
                  variant={selectedMedicationId === med.medicationId ? "default" : "secondary"}
                  size="xs"
                  asChild
                >
                  <Link href={buildRemedioHref(med.medicationId)}>
                    {copy.listCard.detailButton}
                  </Link>
                </Button>
              </>
            }
          />
        ))}
      </CardBody>
    </Card>
  );
}

export { RemediosListCard };
