"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRow } from "@/components/ui/list-row";
import { familyContent } from "@/content/family";
import {
  completeTaskAction,
  reopenTaskAction,
  type AgendaActionResult,
} from "@/modules/agenda/application/agenda-actions";
import type { FamilyTaskItem } from "@/modules/agenda/application/get-consultas-page";
import { cn } from "@/lib/utils";

interface FamilyTasksCardProps {
  openTasks: FamilyTaskItem[];
  completedTasks: FamilyTaskItem[];
  canManage: boolean;
  isPaused: boolean;
  onAddClick: () => void;
  onEditClick: (id: string) => void;
}

const initialState: AgendaActionResult = { ok: false };

function TaskActions({
  taskId,
  status,
  canManage,
  isPaused,
}: {
  taskId: string;
  status: "open" | "completed";
  canManage: boolean;
  isPaused: boolean;
}) {
  const copy = familyContent.consultas.tasks;
  const [, completeAction, completing] = useActionState(
    completeTaskAction,
    initialState,
  );
  const [, reopenAction, reopening] = useActionState(
    reopenTaskAction,
    initialState,
  );

  if (isPaused) return null;

  if (status === "open") {
    return (
      <form action={completeAction}>
        <input type="hidden" name="taskId" value={taskId} />
        <Button variant="secondary" size="xs" type="submit" disabled={completing}>
          {copy.completeButton}
        </Button>
      </form>
    );
  }

  if (canManage) {
    return (
      <form action={reopenAction}>
        <input type="hidden" name="taskId" value={taskId} />
        <Button variant="secondary" size="xs" type="submit" disabled={reopening}>
          {copy.reopenButton}
        </Button>
      </form>
    );
  }

  return null;
}

function FamilyTasksCard({
  openTasks,
  completedTasks,
  canManage,
  isPaused,
  onAddClick,
  onEditClick,
}: FamilyTasksCardProps) {
  const copy = familyContent.consultas;

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{copy.list.tasksTitle}</CardTitle>
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
        {openTasks.length > 0 ? (
          openTasks.map((item) => (
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
                  <TaskActions
                    taskId={item.id}
                    status={item.status}
                    canManage={canManage}
                    isPaused={isPaused}
                  />
                </div>
              }
            />
          ))
        ) : (
          <div className="p-5">
            <EmptyState
              icon={copy.list.tasksEmpty.icon}
              title={copy.list.tasksEmpty.title}
              description={copy.list.tasksEmpty.description}
            />
          </div>
        )}

        {completedTasks.length > 0 ? (
          <>
            <div className="border-t border-line-2 px-5 py-3 text-compact font-bold uppercase tracking-wide text-muted">
              {copy.list.completedSection}
            </div>
            {completedTasks.map((item) => (
              <ListRow
                key={item.id}
                stackOnMobile
                icon={
                  <span
                    className={cn(
                      "flex size-full items-center justify-center rounded-field text-base opacity-50",
                      item.iconBgClass,
                    )}
                  >
                    {item.icon}
                  </span>
                }
                title={<span className="text-muted line-through">{item.title}</span>}
                subtitle={<span className="text-muted">{item.subtitle}</span>}
                trailing={
                  <TaskActions
                    taskId={item.id}
                    status={item.status}
                    canManage={canManage}
                    isPaused={isPaused}
                  />
                }
              />
            ))}
          </>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { FamilyTasksCard };
