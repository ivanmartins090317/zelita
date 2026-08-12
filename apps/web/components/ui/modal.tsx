"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Janela nativa acessível — trap de foco e Escape via `<dialog>`.
 */
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    onClose();
    returnFocusRef.current?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={cn(
        "fixed inset-0 z-50 m-auto w-[min(100%,420px)] max-h-[min(90vh,640px)] overflow-hidden rounded-sheet border border-line bg-white p-0 shadow-card backdrop:bg-ink/40 open:flex open:flex-col",
        className,
      )}
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <div className="flex items-center gap-3 border-b border-line-2 px-5 py-4">
        <h2 id={titleId} className="font-head text-lg font-extrabold text-brand-900">
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-3">{children}</div>
      {footer ? (
        <div className="border-t border-line-2 px-5 py-4">{footer}</div>
      ) : null}
    </dialog>
  );
}

export { Modal };
