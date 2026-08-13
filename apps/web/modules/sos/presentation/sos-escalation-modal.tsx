"use client";

import { useCallback, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import type { SosEscalationListItem } from "@/modules/sos/application/get-pedidos-de-ajuda-page";
import {
  updateSosEscalationAction,
  type SosActionResult,
} from "@/modules/sos/application/sos-actions";
import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

interface SosEscalationModalProps {
  open: boolean;
  onClose: () => void;
  careRecipientId: string;
  candidates: SosEscalationListItem[];
  savedItems: SosEscalationListItem[];
  isPaused: boolean;
}

function buildInitialItems(
  savedItems: SosEscalationListItem[],
  candidates: SosEscalationListItem[],
): {
  items: SosEscalationListItem[];
  viewerPool: SosEscalationListItem[];
} {
  const items =
    savedItems.length > 0
      ? savedItems.map((item, index) => ({ ...item, position: index + 1 }))
      : candidates.filter((item) => item.role !== ACCOUNT_ROLES.viewer);

  const viewerPool = candidates.filter(
    (item) =>
      item.role === ACCOUNT_ROLES.viewer &&
      !items.some((row) => row.memberId === item.memberId),
  );

  return { items, viewerPool };
}

interface SosEscalationModalInnerProps
  extends Omit<SosEscalationModalProps, "open"> {
  initialItems: SosEscalationListItem[];
  initialViewerPool: SosEscalationListItem[];
}

function SosEscalationModalInner({
  onClose,
  careRecipientId,
  initialItems,
  initialViewerPool,
  isPaused,
}: SosEscalationModalInnerProps) {
  const copy = familyContent.pedidosDeAjuda.escalation;
  const modalCopy = copy.modal;
  const [items, setItems] = useState(initialItems);
  const [viewerPool, setViewerPool] = useState(initialViewerPool);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    setItems((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const temp = next[index];
      next[index] = next[target]!;
      next[target] = temp!;
      return next.map((item, position) => ({ ...item, position: position + 1 }));
    });
  }, []);

  const includeViewer = useCallback((viewer: SosEscalationListItem) => {
    setViewerPool((pool) =>
      pool.filter((item) => item.memberId !== viewer.memberId),
    );
    setItems((current) => [
      ...current,
      { ...viewer, position: current.length + 1 },
    ]);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("careRecipientId", careRecipientId);
      formData.set("memberIds", items.map((item) => item.memberId).join(","));

      const result: SosActionResult = await updateSosEscalationAction(
        { ok: false },
        formData,
      );

      setFeedback(result.message ?? null);
      if (result.ok) {
        onClose();
      }
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={modalCopy.title}
      className="w-[min(100%,520px)]"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {modalCopy.cancel}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={pending || isPaused || items.length === 0}
          >
            {pending ? modalCopy.saving : modalCopy.saveButton}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-secondary text-muted">{modalCopy.hint}</p>

      {isPaused ? (
        <Note tone="warning" icon="⏸" className="mb-4">
          {familyContent.pedidosDeAjuda.errors.accountPaused}
        </Note>
      ) : null}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.memberId}
            className="flex items-start gap-3 rounded-xl border border-line-2 bg-sand-1 px-3 py-3"
          >
            <span className="flex size-7 flex-none items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-ink">{item.displayName}</div>
              <div className="text-secondary text-muted">
                {copy.roleLabels[item.role as keyof typeof copy.roleLabels]} ·{" "}
                {item.channelSummary}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
              >
                {modalCopy.moveUp}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
              >
                {modalCopy.moveDown}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {viewerPool.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-line-2 pt-4">
          <p className="text-secondary text-muted">{modalCopy.viewerOptInHint}</p>
          {viewerPool.map((viewer) => (
            <div
              key={viewer.memberId}
              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line px-3 py-3"
            >
              <div>
                <div className="font-semibold text-ink">{viewer.displayName}</div>
                <div className="text-secondary text-muted">
                  {copy.roleLabels.viewer}
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => includeViewer(viewer)}
              >
                {modalCopy.includeViewerButton}
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {feedback ? (
        <p className="mt-4 text-compact font-semibold text-brand-700">{feedback}</p>
      ) : null}
    </Modal>
  );
}

function SosEscalationModal({
  open,
  onClose,
  careRecipientId,
  candidates,
  savedItems,
  isPaused,
}: SosEscalationModalProps) {
  const initialState = useMemo(
    () => buildInitialItems(savedItems, candidates),
    [savedItems, candidates],
  );

  if (!open) return null;

  return (
    <SosEscalationModalInner
      onClose={onClose}
      careRecipientId={careRecipientId}
      candidates={candidates}
      savedItems={savedItems}
      isPaused={isPaused}
      initialItems={initialState.items}
      initialViewerPool={initialState.viewerPool}
    />
  );
}

export { SosEscalationModal };
