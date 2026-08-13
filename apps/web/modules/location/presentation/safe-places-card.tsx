"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { SafePlaceListItem } from "@/modules/location/application/get-localizacao-page";

import { SafePlaceModal } from "./safe-place-modal";

interface SafePlacesCardProps {
  items: SafePlaceListItem[];
  careRecipientId: string;
  canManage: boolean;
}

function SafePlacesCard({
  items,
  careRecipientId,
  canManage,
}: SafePlacesCardProps) {
  const copy = familyContent.localizacao.places;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SafePlaceListItem | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item: SafePlaceListItem) {
    setEditing(item);
    setModalOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader className="justify-between">
          <CardTitle>{copy.title}</CardTitle>
          {canManage ? (
            <Button variant="secondary" size="xs" onClick={openCreate}>
              {copy.addButton}
            </Button>
          ) : null}
        </CardHeader>
        {items.length === 0 ? (
          <EmptyState
            icon="📍"
            title={copy.emptyTitle}
            description={copy.emptyDescription}
          />
        ) : (
          <div>
            {items.map((item) => (
              <ListRow
                key={item.id}
                icon={item.icon}
                title={item.name}
                subtitle={`${item.addressText || "—"} · ${item.subtitle}`}
                trailing={
                  <>
                    <Tag
                      tone={
                        item.tagTone === "safe"
                          ? "ok"
                          : item.tagTone === "warning"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {item.tagLabel}
                    </Tag>
                    {canManage ? (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => openEdit(item)}
                      >
                        {copy.editButton}
                      </Button>
                    ) : null}
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>

      {canManage ? (
        <SafePlaceModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          careRecipientId={careRecipientId}
          place={editing}
        />
      ) : null}
    </>
  );
}

export { SafePlacesCard };
