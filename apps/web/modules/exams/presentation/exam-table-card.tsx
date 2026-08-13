"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip, Chips } from "@/components/ui/chips";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import {
  EXAM_CATEGORY_FILTER_CHIPS,
  EXAM_CATEGORIES,
  type ExamCategory,
} from "@/modules/exams/domain/exam-categories";
import { filterExams } from "@/modules/exams/domain/exam-filters";
import type { ExamListItem } from "@/modules/exams/application/get-exames-page";

interface ExamTableCardProps {
  exams: ExamListItem[];
  selectedExamId: string | null;
  canManage: boolean;
  isPaused: boolean;
  hasHiddenExams: boolean;
  onSelect: (examId: string) => void;
  onAddClick: () => void;
}

function ExamTableCard({
  exams,
  selectedExamId,
  canManage,
  isPaused,
  hasHiddenExams,
  onSelect,
  onAddClick,
}: ExamTableCardProps) {
  const copy = familyContent.exames;
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ExamCategory>("all");

  const filtered = useMemo(
    () =>
      filterExams({
        items: exams.map((exam) => ({
          id: exam.id,
          title: exam.title,
          providerName: exam.providerName,
          originalFileName: exam.fileLine.split(" · ")[0] ?? "",
          examDate: exam.examDate,
          category: exam.category,
        })),
        query,
        categoryFilter,
        formatDate: (date) => date.split("-").reverse().join("/"),
      }).map((item) => exams.find((exam) => exam.id === item.id)!),
    [exams, query, categoryFilter],
  );

  const showEmpty = exams.length === 0;
  const showNotFound = !showEmpty && filtered.length === 0;

  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <CardTitle className="sr-only">{familyContent.areas.exames.title}</CardTitle>
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="min-h-11 flex-1"
            aria-label={copy.searchPlaceholder}
          />
          <Chips className="flex-wrap">
            {EXAM_CATEGORY_FILTER_CHIPS.map((chip) => {
              const label =
                chip.slug === "all"
                  ? copy.filters.all
                  : copy.filters[chip.labelKey];
              const active = categoryFilter === chip.slug;
              return (
                <Chip
                  key={chip.slug}
                  selected={active}
                  onClick={() => setCategoryFilter(chip.slug)}
                >
                  {label}
                </Chip>
              );
            })}
          </Chips>
        </div>
        {canManage ? (
          <Button
            size="sm"
            className="min-h-11 shrink-0"
            onClick={onAddClick}
            disabled={isPaused}
          >
            {copy.table.addButton}
          </Button>
        ) : null}
      </CardHeader>

      <CardBody className="overflow-x-auto p-0">
        {showEmpty ? (
          <div className="px-5 pb-5">
            <EmptyState
              icon="📄"
              title={copy.table.emptyTitle}
              description={copy.table.emptyDescription}
              action={
                canManage && !isPaused ? (
                  <Button onClick={onAddClick}>{copy.table.addButton}</Button>
                ) : undefined
              }
            />
          </div>
        ) : showNotFound ? (
          <div className="px-5 pb-5">
            <EmptyState
              icon="🔍"
              title={copy.table.notFoundTitle}
              description={copy.table.notFoundDescription}
            />
          </div>
        ) : (
          <table className="min-w-[760px] w-full text-left text-body">
            <thead>
              <tr className="border-b border-line-2 text-compact uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-bold">{copy.table.examColumn}</th>
                <th className="px-3 py-3 font-bold">{copy.table.dateColumn}</th>
                <th className="px-3 py-3 font-bold">{copy.table.providerColumn}</th>
                <th className="px-3 py-3 font-bold">{copy.table.categoryColumn}</th>
                <th className="px-3 py-3 font-bold">{copy.table.visibilityColumn}</th>
                <th className="px-5 py-3 font-bold" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((exam) => (
                <tr
                  key={exam.id}
                  className={`border-b border-line-2 last:border-b-0 ${
                    selectedExamId === exam.id ? "bg-brand-50/60" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="min-h-11 text-left"
                      onClick={() => onSelect(exam.id)}
                    >
                      <div className="font-bold text-ink">{exam.title}</div>
                      <div className="text-secondary text-muted">{exam.fileLine}</div>
                    </button>
                  </td>
                  <td className="px-3 py-4 text-ink">{exam.examDateLabel}</td>
                  <td className="px-3 py-4 text-ink">
                    {exam.providerName ?? "—"}
                  </td>
                  <td className="px-3 py-4">
                    <Tag tone={exam.categoryTone}>{exam.categoryLabel}</Tag>
                  </td>
                  <td className="px-3 py-4 text-secondary text-ink">
                    {exam.visibilityLabel}
                  </td>
                  <td className="px-5 py-4">
                    <Button
                      variant="secondary"
                      size="xs"
                      className="min-h-11"
                      onClick={() => onSelect(exam.id)}
                    >
                      {copy.table.openButton}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {hasHiddenExams ? (
          <p className="border-t border-line-2 px-5 py-3 text-compact text-muted">
            {copy.table.hiddenFooter}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export { ExamTableCard, EXAM_CATEGORIES };
