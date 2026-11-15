"use client";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import type { UpcomingAppointmentItem } from "@/modules/agenda/application/get-consultas-page";
import { cn } from "@/lib/utils";

interface UpcomingAppointmentsCardProps {
  items: UpcomingAppointmentItem[];
  canManage: boolean;
  isPaused: boolean;
  onAddClick: () => void;
  onEditClick: (id: string) => void;
}

function UpcomingAppointmentsCard({
  items,
  canManage,
  isPaused,
  onAddClick,
  onEditClick,
}: UpcomingAppointmentsCardProps) {
  const copy = familyContent.consultas;

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.list.appointmentsTitle}</CardTitle>
        {canManage ? (
          <Button
            variant="secondary"
            size="xs"
            type="button"
            disabled={isPaused}
            onClick={onAddClick}
          >
            {copy.list.addButton}
          </Button>
        ) : null}
      </CardHeader>
      <CardBody className="p-0">
        {items.length > 0 ? (
          items.map((item) => (
            <ListRow
              key={item.id}
              stackOnMobile
              icon={
                <span
                  className={cn(
                    "flex size-full items-center justify-center rounded-field text-base",
                    item.iconBgClass,
                  )}
                >
                  {item.icon}
                </span>
              }
              title={item.title}
              subtitle={item.subtitle}
              trailing={
                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                  {canManage && !isPaused ? (
                    <Button
                      variant="secondary"
                      size="xs"
                      type="button"
                      onClick={() => onEditClick(item.id)}
                    >
                      {copy.tasks.editButton}
                    </Button>
                  ) : null}
                  {item.companionTag ? (
                    <Tag tone="ok">{item.companionTag}</Tag>
                  ) : null}
                  {item.preparationTag ? (
                    <Tag tone="warning">{item.preparationTag}</Tag>
                  ) : null}
                </div>
              }
            />
          ))
        ) : (
          <div className="p-5">
            <EmptyState
              icon={copy.list.appointmentsEmpty.icon}
              title={copy.list.appointmentsEmpty.title}
              description={copy.list.appointmentsEmpty.description}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export { UpcomingAppointmentsCard };
