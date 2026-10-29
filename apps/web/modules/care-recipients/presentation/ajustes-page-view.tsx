import { Note } from "@/components/ui/note";
import { familyContent } from "@/content/family";
import type { AjustesPageViewModel } from "@/modules/care-recipients/application/ajustes-view-models";
import { AjustesChannelsCard } from "@/modules/care-recipients/presentation/ajustes-channels-card";
import { AjustesPrivacyCard } from "@/modules/care-recipients/presentation/ajustes-privacy-card";
import { AjustesRecipientCard } from "@/modules/care-recipients/presentation/ajustes-recipient-card";
import { AjustesSignOutFooter } from "@/modules/care-recipients/presentation/ajustes-sign-out-footer";
import { AjustesToneCard } from "@/modules/care-recipients/presentation/ajustes-tone-card";

interface AjustesPageViewProps {
  data: AjustesPageViewModel;
  deviceSubtitle?: string | null;
  deviceLinked?: boolean;
}

function AjustesPageView({
  data,
  deviceSubtitle,
  deviceLinked = false,
}: AjustesPageViewProps) {
  const copy = familyContent.ajustes;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {data.readOnlyNote ? (
        <Note tone="info" icon="ℹ️">
          {data.readOnlyNote}
        </Note>
      ) : null}

      {data.isPaused ? (
        <Note tone="warning" icon="⏸">
          {copy.pausedHint}
        </Note>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <AjustesChannelsCard
          key={data.channels.channelPreference}
          channels={data.channels}
          canEdit={data.canEdit}
          isPaused={data.isPaused}
          tone={data.tone.tone}
          dontBotherBefore={data.tone.dontBotherBefore}
          dontBotherAfter={data.tone.dontBotherAfter}
        />
        <AjustesToneCard
          key={`${data.tone.tone}-${data.tone.dontBotherBefore}-${data.tone.dontBotherAfter}`}
          tone={data.tone}
          channelPreference={data.channels.channelPreference}
          careDisplayName={data.careDisplayName}
          managerName={data.managerName}
          canEdit={data.canEdit}
          isPaused={data.isPaused}
        />
        <AjustesPrivacyCard
          privacy={data.privacy}
          careDisplayName={data.careDisplayName}
          canEdit={data.canEdit}
          isPaused={data.isPaused}
          deviceSubtitle={deviceSubtitle}
          deviceLinked={deviceLinked}
        />
        <AjustesRecipientCard
          careDisplayName={data.careDisplayName}
          fields={data.recipientFields}
          editDefaults={data.recipientEditDefaults}
          canEdit={data.canEdit}
          isPaused={data.isPaused}
        />
      </div>

      <AjustesSignOutFooter />
    </div>
  );
}

export { AjustesPageView };
