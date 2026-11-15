import { type NextRequest } from "next/server";

import {
  authLinkFailureRedirect,
  createAuthRouteClient,
  finishAuthRedirect,
} from "@/app/auth/finish-auth-redirect";
import { parseEmailConfirmParams } from "@/modules/accounts/application/email-confirm";
import { resolvePostAuthDestination } from "@/modules/accounts/application/post-auth-destination";

export async function GET(request: NextRequest) {
  const parsed = parseEmailConfirmParams({
    tokenHash: request.nextUrl.searchParams.get("token_hash"),
    type: request.nextUrl.searchParams.get("type"),
  });
  if (!parsed) return authLinkFailureRedirect(request);

  const client = createAuthRouteClient(request);
  if (!client) return authLinkFailureRedirect(request);

  const { error } = await client.supabase.auth.verifyOtp({
    token_hash: parsed.tokenHash,
    type: parsed.type,
  });
  if (error) return authLinkFailureRedirect(request);

  const {
    data: { user },
  } = await client.supabase.auth.getUser();
  if (!user) return authLinkFailureRedirect(request);

  const route = await resolvePostAuthDestination(client.supabase, user.id);
  return finishAuthRedirect(request, route, client.pendingCookies);
}
