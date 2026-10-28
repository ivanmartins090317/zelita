import { cookies } from "next/headers";

import {
  ELDER_DISPLAY_COOKIE,
  parseElderDisplayCookie,
  type ElderDisplayPreferences,
} from "@/modules/elder-access/domain/elder-display";

export async function readElderDisplayFromCookie(): Promise<ElderDisplayPreferences> {
  const store = await cookies();
  return parseElderDisplayCookie(store.get(ELDER_DISPLAY_COOKIE)?.value);
}
