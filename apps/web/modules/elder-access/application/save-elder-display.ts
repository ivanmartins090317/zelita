"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { elderContent } from "@/content/elder";
import { canViewCareRoutine, getFamilyContext } from "@/modules/accounts";
import { readOptionalUserId } from "@/modules/elder-access/application/read-optional-user-id";
import { lookupActiveDeviceCookie } from "@/modules/elder-access/infrastructure/device-cookie";
import {
  ELDER_DISPLAY_COOKIE,
  ELDER_DISPLAY_MAX_AGE_SECONDS,
  parseElderDisplayCookie,
  serializeElderDisplay,
  type ElderDisplayPreferences,
} from "@/modules/elder-access/domain/elder-display";

export interface SaveElderDisplayResult {
  ok: boolean;
  message?: string;
}

function readExactDisplay(input: unknown): ElderDisplayPreferences | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const record = input as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 3) return null;
  if (!keys.includes("text") || !keys.includes("contrast") || !keys.includes("cue")) {
    return null;
  }
  const parsed = parseElderDisplayCookie(JSON.stringify(record));
  if (
    parsed.text !== record.text ||
    parsed.contrast !== record.contrast ||
    parsed.cue !== record.cue
  ) {
    return null;
  }
  return parsed;
}

export async function saveElderDisplayAction(
  input: unknown,
): Promise<SaveElderDisplayResult> {
  const prefs = readExactDisplay(input);
  if (!prefs) {
    return { ok: false, message: elderContent.settings.saveError };
  }

  const device = await lookupActiveDeviceCookie();
  if (device.status !== "active") {
    const userId = await readOptionalUserId();
    if (!userId) {
      return { ok: false, message: elderContent.settings.saveDenied };
    }
    const ctx = await getFamilyContext();
    if (!ctx.role || !canViewCareRoutine(ctx.role)) {
      return { ok: false, message: elderContent.settings.saveDenied };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(ELDER_DISPLAY_COOKIE, serializeElderDisplay(prefs), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ELDER_DISPLAY_MAX_AGE_SECONDS,
  });
  revalidatePath("/idoso", "layout");
  return { ok: true };
}
