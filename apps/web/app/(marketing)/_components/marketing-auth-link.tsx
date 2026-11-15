"use client";

import { useEffect } from "react";

import { loginContent } from "@/content/login";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/client";

/**
 * O link do Supabase às vezes volta para a home só com o fragmento
 * (#access_token). O servidor não vê isso. Este componente grava a sessão
 * e segue para o mesmo destino de quem digitou o código.
 */
export function MarketingAuthLink() {
  useEffect(() => {
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    if (!hash.includes("access_token=") || !hash.includes("refresh_token=")) {
      return;
    }
    if (!isSupabaseBrowserConfigured()) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) return;

    const supabase = createSupabaseBrowserClient();
    void supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        const failure = `/entrar?erro=${encodeURIComponent(loginContent.messages.emailLinkFailure)}`;
        if (error) {
          window.location.replace(failure);
          return;
        }
        window.location.replace("/auth/session");
      });
  }, []);

  return null;
}
