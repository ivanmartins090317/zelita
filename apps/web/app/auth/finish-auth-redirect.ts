import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { loginContent } from "@/content/login";
import {
  buildSelectedAccountCookieOptions,
  SELECTED_ACCOUNT_COOKIE,
} from "@/modules/accounts/application/account-selection";
import { isAuthRedirectPath } from "@/modules/accounts/application/email-confirm";
import { destinationPathForRoute } from "@/modules/accounts/application/login-routing";
import type { PostLoginRoute } from "@/modules/accounts/application/login-routing";

interface AuthCookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
}

export interface AuthCookie {
  name: string;
  value: string;
  options?: AuthCookieOptions;
}

export interface AuthRouteClient {
  supabase: ReturnType<typeof createServerClient>;
  pendingCookies: AuthCookie[];
}

/** Cliente da rota de auth: os cookies da sessão vão na resposta de redirect. */
export function createAuthRouteClient(
  request: NextRequest,
): AuthRouteClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const pendingCookies: AuthCookie[] = [];
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.push(...cookiesToSet);
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
        }
      },
    },
  });

  return { supabase, pendingCookies };
}

export function authLinkFailureRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = "";
  url.searchParams.set("erro", loginContent.messages.emailLinkFailure);
  return NextResponse.redirect(url);
}

/** Abre o destino do login e grava a sessão no mesmo response. */
export function finishAuthRedirect(
  request: NextRequest,
  route: PostLoginRoute,
  pendingCookies: AuthCookie[],
): NextResponse {
  const path = destinationPathForRoute(route);
  const safePath = isAuthRedirectPath(path) ? path : "/entrar";
  const url = request.nextUrl.clone();
  url.pathname = safePath;
  url.search = "";

  const response = NextResponse.redirect(url);
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  if (route.accountId && safePath !== "/entrar") {
    const options = buildSelectedAccountCookieOptions(
      process.env.NODE_ENV === "production",
    );
    response.cookies.set(SELECTED_ACCOUNT_COOKIE, route.accountId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: options.secure,
      maxAge: options.maxAge,
    });
  }

  return response;
}
