"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { familyRoutes } from "@/content/family";
import type { PedidosDeAjudaPageViewModel } from "@/modules/sos/application/get-pedidos-de-ajuda-page";
import { SosDisclaimerBanner } from "@/modules/sos/presentation/sos-disclaimer-banner";
import { SosEscalationCard } from "@/modules/sos/presentation/sos-escalation-card";
import { SosEscalationModal } from "@/modules/sos/presentation/sos-escalation-modal";
import { SosHistoryCard } from "@/modules/sos/presentation/sos-history-card";
import { SosLastAlertCard } from "@/modules/sos/presentation/sos-last-alert-card";
import { SosResolveModal } from "@/modules/sos/presentation/sos-resolve-modal";

interface PedidosDeAjudaPageViewProps {
  data: PedidosDeAjudaPageViewModel;
}

function PedidosDeAjudaPageView({ data }: PedidosDeAjudaPageViewProps) {
  const router = useRouter();
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  const selectAlert = useCallback(
    (alertId: string) => {
      router.push(`${familyRoutes.pedidosDeAjuda}?alerta=${alertId}`);
    },
    [router],
  );

  return (
    <>
      <SosDisclaimerBanner />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SosLastAlertCard
          alert={data.selectedAlert}
          onResolve={() => setResolveOpen(true)}
        />

        <div className="space-y-4">
          <SosEscalationCard
            items={data.escalationItems}
            empty={data.escalationEmpty}
            invalidWarning={data.escalationInvalidWarning}
            singleContactWarning={data.showSingleContactWarning}
            canManage={data.canManageEscalation}
            isPaused={data.isPaused}
            onChangeOrder={() => setEscalationOpen(true)}
          />

          <SosHistoryCard
            items={data.historyItems}
            selectedAlertId={data.selectedAlertId}
            onSelect={selectAlert}
          />
        </div>
      </div>

      <SosEscalationModal
        key={
          escalationOpen
            ? data.escalationItems.map((item) => item.memberId).join("-") ||
              "default"
            : "closed"
        }
        open={escalationOpen}
        onClose={() => setEscalationOpen(false)}
        careRecipientId={data.careRecipientId}
        candidates={data.modalCandidates}
        savedItems={data.escalationItems}
        isPaused={data.isPaused}
      />

      <SosResolveModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        alertId={data.selectedAlert?.showResolveAction ? data.selectedAlert.id : null}
      />
    </>
  );
}

export { PedidosDeAjudaPageView };
