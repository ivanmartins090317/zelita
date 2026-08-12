import { redirect } from "next/navigation";

import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { listUserMemberships } from "@/modules/accounts/application/family-context";
import { isAccountOnboardingComplete } from "@/modules/accounts/application/login-routing";
import { SignupForm } from "@/modules/care-recipients/presentation/signup-form";
import { SignupMark } from "@/modules/care-recipients/presentation/signup-mark";
import {
  resolveSignupInitialStep,
} from "@/modules/care-recipients/application/signup-routing";

export default async function CadastroPage() {
  let isAuthenticated = false;
  let userEmail: string | null = null;
  let hasCompleteAccount = false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        isAuthenticated = true;
        userEmail = user.email ?? null;
        const memberships = await listUserMemberships(supabase, user.id);
        hasCompleteAccount = memberships.some((item) =>
          isAccountOnboardingComplete({
            accountId: item.accountId,
            careRecipientId: item.careRecipientId,
          }),
        );

        if (hasCompleteAccount) {
          redirect("/familia");
        }
      }
    } catch {
      /* visitante anônimo */
    }
  }

  const initialStep = resolveSignupInitialStep({
    isAuthenticated,
    hasCompleteAccount,
  });

  return (
    <main className="mx-auto flex min-h-full w-full max-w-[520px] flex-1 flex-col justify-center px-6 py-12 sm:py-16">
      <SignupMark />
      <SignupForm
        initialStep={initialStep}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
      />
    </main>
  );
}
