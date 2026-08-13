import { Note } from "@/components/ui/note";
import type { AvisosPageViewModel } from "@/modules/alerts/application/get-avisos-page";
import { AlertFeedCard } from "@/modules/alerts/presentation/alert-feed-card";
import { NotificationMatrixCard } from "@/modules/alerts/presentation/notification-matrix-card";
import { familyContent } from "@/content/family";

interface AvisosPageViewProps {
  data: AvisosPageViewModel;
  members: Array<{
    memberId: string;
    role: import("@/modules/accounts/domain/roles").AccountRole;
  }>;
}

function AvisosPageView({ data, members }: AvisosPageViewProps) {
  const copy = familyContent.avisos;

  return (
    <div className="space-y-4">
      {data.isPaused ? (
        <Note icon="⏸" tone="warning">
          {copy.pausedHint}
        </Note>
      ) : null}

      <AlertFeedCard
        data={{
          feedItems: data.feedItems,
          activeFilter: data.activeFilter,
          hasMore: data.hasMore,
          feedEmpty: data.feedEmpty,
          filterEmptyCopy: data.filterEmptyCopy,
          totalCount: data.totalCount,
        }}
      />

      {data.matrix ? (
        <NotificationMatrixCard
          matrix={data.matrix}
          canEdit={data.canEditMatrix}
          isPaused={data.isPaused}
          members={members}
        />
      ) : null}
    </div>
  );
}

export { AvisosPageView };
