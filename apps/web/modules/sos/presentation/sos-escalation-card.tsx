"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ListRow } from "@/components/ui/list-row";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import type { SosEscalationListItem } from "@/modules/sos/application/get-pedidos-de-ajuda-page";

interface SosEscalationCardProps {
  items: SosEscalationListItem[];
  empty: boolean;
  invalidWarning: boolean;
  singleContactWarning: boolean;
  canManage: boolean;
  isPaused: boolean;
  onChangeOrder: () => void;
}

function SosEscalationCard({
  items,
  empty,
  invalidWarning,
  singleContactWarning,
  canManage,
  isPaused,
  onChangeOrder,
}: SosEscalationCardProps) {
  const copy = familyContent.pedidosDeAjuda.escalation;

  return (
    <Card>
      <CardHeader className="justify-between gap-2">
        <CardTitle>{copy.title}</CardTitle>
        {canManage ? (
          <Button
            variant="secondary"
            size="xs"
            onClick={onChangeOrder}
            disabled={isPaused}
          >
            {copy.changeOrderButton}
          </Button>
        ) : null}
      </CardHeader>
      {invalidWarning ? (
        <div className="px-4 pb-2">
          <Note tone="warning" icon="⚠">
            {copy.invalidWarning}
          </Note>
        </div>
      ) : null}
      {singleContactWarning ? (
        <div className="px-4 pb-2">
          <Note tone="warning" icon="ℹ">
            {copy.singleContactWarning}
          </Note>
        </div>
      ) : null}
      {empty ? (
        <CardBody>
          <p className="text-secondary text-muted">{copy.emptyHint}</p>
        </CardBody>
      ) : (
        <div>
          {items.map((item) => (
            <ListRow
              key={item.memberId}
              icon={
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                  {item.position}
                </span>
              }
              title={item.displayName}
              subtitle={`${item.roleLabel}${item.relationshipLabel ? ` · ${item.relationshipLabel}` : ""} — ${item.channelSummary}`}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export { SosEscalationCard };
