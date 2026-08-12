/**
 * Stub do cliente Supabase.
 * Sem env, não inicializa SDK — fatias futuras usam `@supabase/ssr`.
 */
export interface SupabaseStubConfig {
  url?: string;
  anonKey?: string;
}

export function isSupabaseConfigured(
  config: SupabaseStubConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
): boolean {
  return Boolean(config.url && config.anonKey);
}

export function getSupabaseStubStatus(): "ready" | "unconfigured" {
  return isSupabaseConfigured() ? "ready" : "unconfigured";
}
