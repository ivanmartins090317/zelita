import type { ReactNode } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tag } from "@/components/ui/tag";
import {
  familyContent,
  formatChecklistProgress,
  type FamilyChecklistTaskContent,
} from "@/content/family";
import type { OnboardingChecklistResult } from "@/modules/accounts/application/onboarding-checklist";

interface HojeChecklistCardProps {
  variant: "primeiro_acesso" | "central";
  checklist: OnboardingChecklistResult;
  canManageMedications: boolean;
  isPaused: boolean;
  medicationCount: number;
  activeMemberCount?: number;
  trailing?: ReactNode;
}

function resolveTaskTone(
  task: FamilyChecklistTaskContent,
  index: number,
): "ok" | "muted" {
  return task.durationTone ?? (index === 0 ? "ok" : "muted");
}

function HojeChecklistCard({
  variant,
  checklist,
  canManageMedications,
  isPaused,
  medicationCount,
  activeMemberCount = 1,
  trailing,
}: HojeChecklistCardProps) {
  const copy = familyContent.hoje;
  const title =
    variant === "primeiro_acesso"
      ? copy.primeiroAcesso.checklistTitle
      : copy.maduro.centralTitle;
  const progressLabel =
    variant === "primeiro_acesso"
      ? formatChecklistProgress(
          copy.primeiroAcesso.progressFeitas,
          checklist.completedCount,
        )
      : formatChecklistProgress(
          copy.maduro.centralProgressProntas,
          checklist.completedCount,
        );

  return (
    <Card>
      <CardHeader className="justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="ml-auto flex items-center gap-2">
          {trailing}
          <Tag tone="info">{progressLabel}</Tag>
        </div>
      </CardHeader>
      <CardBody className="space-y-0 pb-2 pt-0">
        <Progress
          value={checklist.progressPercent}
          label={progressLabel}
          className="mb-4"
        />

        {variant === "primeiro_acesso"
          ? copy.checklistTasks.map((task, index) => {
              const completed = checklist.tasks[index]?.completed ?? false;
              const showCta =
                index === 0 ? canManageMedications && !isPaused : true;

              return (
                <div
                  key={task.title}
                  className="flex flex-col gap-3 border-b border-line-2 py-4 last:border-b-0 sm:flex-row sm:items-center"
                >
                  <span
                    className={`flex size-8 flex-none items-center justify-center rounded-full text-sm font-extrabold ${
                      completed
                        ? "bg-ok-bg text-ok"
                        : index === 0
                          ? "bg-brand-600 text-white"
                          : "bg-sand-2 text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-ink">{task.title}</div>
                    <div className="text-secondary text-muted">
                      {task.subtitle}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <Tag tone={resolveTaskTone(task, index)}>
                      {task.durationTag}
                    </Tag>
                    {showCta ? (
                      <Button variant="secondary" size="xs" asChild>
                        <Link href={task.href}>{task.ctaLabel}</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          : copy.maduro.checklistAreas.map((area, index) => {
              const completed = checklist.tasks[index]?.completed ?? false;
              const detail =
                area.id === "medications"
                  ? String(medicationCount)
                  : area.id === "members"
                    ? String(activeMemberCount)
                    : "";
              const label = completed
                ? area.labelDone.replace("{detail}", detail)
                : area.labelPending;

              return (
                <div
                  key={area.id}
                  className="flex items-center gap-2.5 py-2 text-body"
                >
                  <span
                    className={
                      completed
                        ? "font-extrabold text-ok"
                        : "font-extrabold text-muted"
                    }
                  >
                    {completed ? "✓" : "○"}
                  </span>
                  {area.href && !completed ? (
                    <Link
                      href={area.href}
                      className="font-semibold text-brand-600"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className={completed ? "text-ink" : "text-muted"}>
                      {label}
                    </span>
                  )}
                </div>
              );
            })}

        <p className="border-t border-line-2 pt-4 text-secondary text-muted">
          {variant === "primeiro_acesso"
            ? copy.primeiroAcesso.checklistFooter
            : copy.maduro.centralFooter}
        </p>
      </CardBody>
    </Card>
  );
}

export { HojeChecklistCard };
