import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function isSupabaseConfigured(config?: {
  url?: string;
  anonKey?: string;
}): boolean {
  const url = config?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = config?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey);
}

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em apps/web/.env.local.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component sem permissão de set — middleware renova sessão.
        }
      },
    },
  });
}

/** Service role — só Route Handlers / Inngest. Nunca no client. */
export function createSupabaseServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Service role ausente. Preencha SUPABASE_SERVICE_ROLE_KEY só no servidor (.env.local).",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
