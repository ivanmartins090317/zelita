"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { familyContent } from "@/content/family";

import { LocationShareModal } from "./location-share-modal";

interface LocationShareCardProps {
  canCreate: boolean;
  disabledReason: string | null;
  careRecipientId: string;
}

function LocationShareCard({
  canCreate,
  disabledReason,
  careRecipientId,
}: LocationShareCardProps) {
  const copy = familyContent.localizacao.share;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-secondary text-muted">{copy.body}</p>
          <Button
            variant="secondary"
            className="min-h-11 w-full"
            disabled={!canCreate}
            title={disabledReason ?? undefined}
            onClick={() => setOpen(true)}
          >
            {copy.createButton}
          </Button>
          {!canCreate && disabledReason ? (
            <p className="text-compact text-muted">{disabledReason}</p>
          ) : null}
        </CardBody>
      </Card>

      <LocationShareModal
        open={open}
        onClose={() => setOpen(false)}
        careRecipientId={careRecipientId}
      />
    </>
  );
}

export { LocationShareCard };
