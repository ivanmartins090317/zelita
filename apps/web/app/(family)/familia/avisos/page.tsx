import { EmptyState } from "@/components/ui/empty-state";
import { familyContent } from "@/content/family";
import { getAvisosPage } from "@/modules/alerts/application/get-avisos-page";
import { AvisosPageView } from "@/modules/alerts/presentation/avisos-page-view";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface AvisosPageProps {
  searchParams: Promise<{
    filtro?: string;
    offset?: string;
  }>;
}

export default async function AvisosPage({ searchParams }: AvisosPageProps) {
  const params = await searchParams;
  const offset = params.offset ? Number(params.offset) : 0;

  const result = await getAvisosPage({
    filter: params.filtro ?? null,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  if (!result.ok) {
    return (
      <EmptyState
        icon="🔔"
        title={familyContent.avisos.errors.loadTitle}
        description={result.message}
      />
    );
  }

  const ctx = await getFamilyContext();
  const supabase = await createSupabaseServerClient();
  const memberRows =
    ctx.accountId != null
      ? await fetchParticipantRows(supabase, ctx.accountId)
      : [];

  const members = memberRows
    .filter((row) => row.kind === "member")
    .map((row) => ({
      memberId: row.id,
      role: row.role,
    }));

  return <AvisosPageView data={result.data} members={members} />;
}
