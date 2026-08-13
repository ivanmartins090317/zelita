import { AcceptInviteView } from "@/modules/accounts/presentation/accept-invite-view";
import { getAcceptInvitePreview } from "@/modules/accounts/application/accept-invite";
import type { AccountRole } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ConvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function ConvitePage({ params }: ConvitePageProps) {
  const { token } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const preview = await getAcceptInvitePreview({
    token,
    sessionEmail: user?.email ?? null,
  });

  if (!preview.ok) {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12">
        <AcceptInviteView
          token={token}
          state="not_found"
          inviterName={null}
          role={null}
          careRecipientDisplayName={null}
          invitedEmail={null}
          isAuthenticated={Boolean(user)}
          emailMatches={false}
        />
      </main>
    );
  }

  if (preview.state === "ready") {
    return (
      <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12">
        <AcceptInviteView
          token={token}
          state="ready"
          inviterName={preview.inviterName}
          role={preview.role as AccountRole}
          careRecipientDisplayName={preview.careRecipientDisplayName}
          invitedEmail={preview.invitedEmail}
          isAuthenticated={preview.isAuthenticated}
          emailMatches={preview.emailMatches}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12">
      <AcceptInviteView
        token={token}
        state={preview.state}
        inviterName={null}
        role={null}
        careRecipientDisplayName={null}
        invitedEmail={null}
        isAuthenticated={Boolean(user)}
        emailMatches={false}
      />
    </main>
  );
}
