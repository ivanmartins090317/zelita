import { type NextRequest } from "next/server";

import {
  authLinkFailureRedirect,
  createAuthRouteClient,
  finishAuthRedirect,
} from "@/app/auth/finish-auth-redirect";
import { resolvePostAuthDestination } from "@/modules/accounts/application/post-auth-destination";

/** Sessão já gravada no navegador (fragmento do link). Só escolhe o destino. */
export async function GET(request: NextRequest) {
  const client = createAuthRouteClient(request);
  if (!client) return authLinkFailureRedirect(request);

  const {
    data: { user },
  } = await client.supabase.auth.getUser();
  if (!user) return authLinkFailureRedirect(request);

  const route = await resolvePostAuthDestination(client.supabase, user.id);
  return finishAuthRedirect(request, route, client.pendingCookies);
}
