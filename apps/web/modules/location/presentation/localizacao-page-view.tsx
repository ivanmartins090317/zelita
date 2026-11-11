"use client";

import { useState } from "react";

import type { LocalizacaoPageViewModel } from "@/modules/location/application/get-localizacao-page";

import { LocationConsentBanner } from "./location-consent-banner";
import { LocationHistoryCard } from "./location-history-card";
import { LocationLimitationsCard } from "./location-limitations-card";
import { LocationMapCard } from "./location-map-card";
import { LocationShareCard } from "./location-share-card";
import { LocationShareModal } from "./location-share-modal";
import { LocationRequestCard } from "./location-request-card";
import { SafePlacesCard } from "./safe-places-card";

interface LocalizacaoPageViewProps {
  data: LocalizacaoPageViewModel;
}

function LocalizacaoPageView({ data }: LocalizacaoPageViewProps) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <LocationConsentBanner banner={data.consentBanner} />

      {data.locationRequest ? (
        <div className="mb-4">
          <LocationRequestCard card={data.locationRequest} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <LocationMapCard
          map={data.map}
          stats={data.stats}
          apelido={data.careRecipientDisplayName}
          focusAlert={data.focusAlert}
          onShareClick={
            data.canCreateShare ? () => setShareOpen(true) : undefined
          }
        />

        <div className="space-y-4">
          <SafePlacesCard
            items={data.safePlaces}
            careRecipientId={data.careRecipientId}
            canManage={data.canManagePlaces}
          />
          <LocationShareCard
            canCreate={data.canCreateShare}
            disabledReason={data.shareDisabledReason}
            careRecipientId={data.careRecipientId}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <LocationHistoryCard items={data.history} empty={data.historyEmpty} />
        <LocationLimitationsCard />
      </div>

      {data.canCreateShare ? (
        <LocationShareModal
          key={shareOpen ? "open" : "closed"}
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          careRecipientId={data.careRecipientId}
        />
      ) : null}
    </>
  );
}

export { LocalizacaoPageView };
