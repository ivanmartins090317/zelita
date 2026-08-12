import { redirect } from "next/navigation";

import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { listUserMemberships } from "@/modules/accounts/application/family-context";
import { isAccountOnboardingComplete } from "@/modules/accounts/application/login-routing";
import { resolveSignupInitialStep } from "@/modules/care-recipients/application/signup-routing";
import { signupRoutes } from "@/content/signup";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) {
    redirect(signupRoutes.cadastro);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const memberships = await listUserMemberships(supabase, user.id);
      const hasCompleteAccount = memberships.some((item) =>
        isAccountOnboardingComplete({
          accountId: item.accountId,
          careRecipientId: item.careRecipientId,
        }),
      );

      if (hasCompleteAccount) {
        redirect("/familia");
      }
    }

    resolveSignupInitialStep({
      isAuthenticated: Boolean(user),
      hasCompleteAccount: false,
    });
  } catch {
    /* redirect canônico */
  }

  redirect(signupRoutes.cadastro);
}
