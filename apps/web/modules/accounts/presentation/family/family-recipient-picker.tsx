"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { ListRow } from "@/components/ui/list-row";
import { Modal } from "@/components/ui/modal";
import { Tag } from "@/components/ui/tag";
import { familyContent } from "@/content/family";
import { selectAccountAction } from "@/modules/accounts/application/select-account-action";
import {
  formatRecipientAgeLine,
  type ShellContext,
} from "@/modules/accounts/application/shell-context";

interface FamilyRecipientPickerProps {
  shell: ShellContext;
}

function FamilyRecipientPicker({ shell }: FamilyRecipientPickerProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const copy = familyContent.recipientPicker;

  const ageLine = formatRecipientAgeLine({
    age: shell.careRecipientAge,
    ageUnknownCopy: copy.ageUnknown,
  });

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleSelect(accountId: string) {
    if (accountId === shell.accountId) {
      handleClose();
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await selectAccountAction(accountId);
      if (!result.ok) {
        setError(result.message ?? copy.switchError);
        return;
      }
      handleClose();
      router.refresh();
    });
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="mb-3.5 flex min-h-tap w-full items-center gap-2.5 rounded-control bg-white/10 px-2.5 py-2.5 text-left transition-colors hover:bg-white/15"
        aria-haspopup="dialog"
      >
        <span
          aria-hidden
          className="flex size-8 flex-none items-center justify-center rounded-pill bg-brand-400 text-[13px] font-extrabold text-brand-900"
        >
          {shell.careRecipientInitials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-bold text-white">
            {shell.careRecipientDisplayName}
          </span>
          <span className="block truncate text-[11px] text-on-dark-muted">
            {ageLine} · {copy.switchLabel}
          </span>
        </span>
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        title={copy.modalTitle}
        footer={
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            {copy.closeLabel}
          </Button>
        }
      >
        <div className="-mx-5">
          {shell.memberships.map((membership) => (
            <button
              key={membership.accountId}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(membership.accountId)}
              className="block w-full text-left disabled:opacity-60"
            >
              <ListRow
                icon={
                  <span className="flex size-9 items-center justify-center rounded-pill bg-brand-600 text-xs font-extrabold text-white">
                    {membership.initials}
                  </span>
                }
                title={membership.displayName}
                subtitle={membership.subtitle}
                trailing={
                  membership.isSelected ? (
                    <Tag tone="ok">{copy.selectedTag}</Tag>
                  ) : null
                }
              />
            </button>
          ))}

          <div className="border-t border-line-2 px-5 py-4 opacity-60">
            <ListRow
              icon={
                <span className="flex size-9 items-center justify-center rounded-pill bg-sand-2 text-lg">
                  +
                </span>
              }
              title={copy.addAnotherTitle}
              subtitle={copy.addAnotherSubtitle}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-compact text-coral-dark" role="alert">
            {error}
          </p>
        ) : null}
      </Modal>
    </>
  );
}

export { FamilyRecipientPicker };
