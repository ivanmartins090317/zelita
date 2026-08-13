"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Modal } from "@/components/ui/modal";
import { familyContent } from "@/content/family";
import type { SosHistoryListItem } from "@/modules/sos/application/get-pedidos-de-ajuda-page";

interface SosHistoryCardProps {
  items: SosHistoryListItem[];
  selectedAlertId: string | null;
  onSelect: (alertId: string) => void;
}

function SosHistoryCard({
  items,
  selectedAlertId,
  onSelect,
}: SosHistoryCardProps) {
  const copy = familyContent.pedidosDeAjuda.history;
  const [testOpen, setTestOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        {items.length === 0 ? (
          <CardBody>
            <EmptyState
              icon="🆘"
              title="Nenhum acionamento anterior"
              description="Quando houver pedidos de ajuda, eles aparecerão aqui."
            />
          </CardBody>
        ) : (
          <div>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="w-full text-left"
                onClick={() => onSelect(item.id)}
              >
                <ListRow
                  icon={item.icon}
                  title={`${item.dateLabel} · ${item.timeLabel}`}
                  subtitle={item.summary}
                  className={
                    selectedAlertId === item.id
                      ? "bg-brand-50"
                      : undefined
                  }
                />
              </button>
            ))}
          </div>
        )}
        <CardBody className="border-t border-line-2 pt-4">
          <Button
            variant="emergency"
            className="w-full"
            onClick={() => setTestOpen(true)}
          >
            {copy.testButton}
          </Button>
        </CardBody>
      </Card>

      <Modal
        open={testOpen}
        onClose={() => setTestOpen(false)}
        title={copy.testModalTitle}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" asChild>
              <Link href="/idoso">{copy.testButton}</Link>
            </Button>
            <Button className="flex-1" onClick={() => setTestOpen(false)}>
              {copy.testModalClose}
            </Button>
          </div>
        }
      >
        <p className="text-secondary text-muted">{copy.testModalBody}</p>
      </Modal>
    </>
  );
}

export { SosHistoryCard };
