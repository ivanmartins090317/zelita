import * as Sentry from "@sentry/nextjs";

import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function readOptionalUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    Sentry.captureMessage("elder_preview_session_failed", {
      level: "warning",
      tags: { event: "elder_preview_session_failed" },
    });
    return null;
  }
}
