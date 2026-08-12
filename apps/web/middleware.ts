import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isFamily = pathname.startsWith("/familia");
  const isOnboarding = pathname.startsWith("/onboarding");
  const needsAuth = isFamily || isOnboarding;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (needsAuth) {
      const login = request.nextUrl.clone();
      login.pathname = "/entrar";
      login.searchParams.set(
        "erro",
        "Configure o Supabase em apps/web/.env.local para entrar.",
      );
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  const response = await updateSession(request);

  if (!needsAuth) return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const { createServerClient } = await import("@supabase/ssr");
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        /* cookies já aplicados em updateSession */
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/entrar";
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: ["/familia/:path*", "/onboarding/:path*", "/entrar", "/auth/:path*"],
};
