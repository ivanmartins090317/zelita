"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";
import type { AjustesRecipientField } from "@/modules/care-recipients/application/ajustes-view-models";
import { AjustesRecipientEditModal } from "@/modules/care-recipients/presentation/ajustes-recipient-edit-modal";

interface AjustesRecipientCardProps {
  careDisplayName: string;
  fields: AjustesRecipientField[];
  editDefaults: {
    fullName: string;
    displayName: string;
    birthDate: string;
    whatsapp: string;
    addressText: string;
  };
  canEdit: boolean;
  isPaused: boolean;
}

function AjustesRecipientCard({
  careDisplayName,
  fields,
  editDefaults,
  canEdit,
  isPaused,
}: AjustesRecipientCardProps) {
  const copy = familyContent.ajustes.recipient;
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden>👤</span>
            <CardTitle>
              {copy.cardTitleTemplate.replace("{apelido}", careDisplayName)}
            </CardTitle>
          </div>
          {canEdit ? (
            <Button
              variant="secondary"
              size="xs"
              disabled={isPaused}
              onClick={() => setEditOpen(true)}
            >
              {copy.editButton}
            </Button>
          ) : null}
        </CardHeader>
        <CardBody className="p-0">
          <dl>
            {fields.map((field) => (
              <div
                key={field.label}
                className="grid gap-1 border-b border-line-2 px-5 py-4 last:border-b-0 sm:grid-cols-[160px_1fr]"
              >
                <dt className="text-secondary font-semibold text-muted">
                  {field.label}
                </dt>
                <dd className="text-body text-ink">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      {canEdit ? (
        <AjustesRecipientEditModal
          key={`${editDefaults.fullName}-${editDefaults.displayName}-${editOpen}`}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          defaults={editDefaults}
        />
      ) : null}
    </>
  );
}

export { AjustesRecipientCard };
