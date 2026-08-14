"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";

function PlanoChangeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const copy = familyContent.plano.modals.changePlan;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={copy.title}
      footer={
        <Button type="button" size="sm" disabled>
          {copy.ctaLabel}
        </Button>
      }
    >
      <div className="space-y-4 text-secondary">
        <div>
          <p className="font-bold text-ink">{copy.essentialTitle}</p>
          <p>{copy.essentialBody}</p>
        </div>
        <div>
          <p className="font-bold text-ink">{copy.cuidadoPlusTitle}</p>
          <p>{copy.cuidadoPlusBody}</p>
        </div>
        <Note tone="info" icon="ℹ️">
          {copy.familiaNote}
        </Note>
      </div>
    </Modal>
  );
}

function PlanoBillingActions({
  showReactivateCta,
  supportMailto,
}: {
  showReactivateCta: boolean;
  supportMailto: string;
}) {
  const copy = familyContent.plano.currentCard.actions;
  const modals = familyContent.plano.modals;
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [invoicesOpen, setInvoicesOpen] = useState(false);

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px]"
          onClick={() => setChangePlanOpen(true)}
        >
          {copy.changePlan}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px]"
          disabled
          title={modals.changeCard.body}
        >
          {copy.changeCard}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-[44px]"
          onClick={() => setInvoicesOpen(true)}
        >
          {copy.invoices}
        </Button>
        {showReactivateCta ? (
          <Button
            asChild
            variant="primary"
            size="sm"
            className="min-h-[44px]"
          >
            <a href={supportMailto}>{copy.reactivate}</a>
          </Button>
        ) : null}
      </div>

      <PlanoChangeModal
        open={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
      />
      <Modal
        open={invoicesOpen}
        onClose={() => setInvoicesOpen(false)}
        title={modals.invoices.title}
        footer={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInvoicesOpen(false)}
          >
            {modals.closeLabel}
          </Button>
        }
      >
        <p className="font-bold text-ink">{modals.invoices.emptyTitle}</p>
        <p className="mt-2 text-secondary">{modals.invoices.body}</p>
      </Modal>
    </>
  );
}

export { PlanoBillingActions };
