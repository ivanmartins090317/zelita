import { type NextRequest } from "next/server";

import {
  authLinkFailureRedirect,
  createAuthRouteClient,
  finishAuthRedirect,
} from "@/app/auth/finish-auth-redirect";
import { resolvePostAuthDestination } from "@/modules/accounts/application/post-auth-destination";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() ?? "";
  if (!code) return authLinkFailureRedirect(request);

  const client = createAuthRouteClient(request);
  if (!client) return authLinkFailureRedirect(request);

  const { error } = await client.supabase.auth.exchangeCodeForSession(code);
  if (error) return authLinkFailureRedirect(request);

  const {
    data: { user },
  } = await client.supabase.auth.getUser();
  if (!user) return authLinkFailureRedirect(request);

  const route = await resolvePostAuthDestination(client.supabase, user.id);
  return finishAuthRedirect(request, route, client.pendingCookies);
}
