import { cookies } from "next/headers";

import {
  ELDER_DEVICE_COOKIE,
  ELDER_DEVICE_COOKIE_PATH,
  DEVICE_COOKIE_MAX_AGE_SECONDS,
  isDeviceLinkTokenShape,
} from "@/modules/elder-access/domain/device-link";
import {
  deviceSecretsMatch,
  hashDeviceSecret,
} from "@/modules/elder-access/domain/device-secret";
import {
  findDeviceBySecretHash,
  type ActiveDeviceRow,
} from "@/modules/elder-access/infrastructure/device-link-store";

export interface ActiveElderDevice {
  id: string;
  accountId: string;
  careRecipientId: string;
}

export type DeviceCookieLookup =
  | { status: "absent" }
  | { status: "active"; device: ActiveElderDevice }
  | { status: "failed" };

export async function readDeviceCookieValue(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(ELDER_DEVICE_COOKIE)?.value ?? "";
  if (!isDeviceLinkTokenShape(value)) return null;
  return value;
}

export async function lookupActiveDeviceCookie(): Promise<DeviceCookieLookup> {
  const secret = await readDeviceCookieValue();
  if (!secret) return { status: "absent" };

  try {
    const hash = hashDeviceSecret(secret);
    const row = await findDeviceBySecretHash(hash);
    if (!row || !deviceSecretsMatch(hash, row.secretHash)) return { status: "absent" };
    return { status: "active", device: toDevice(row) };
  } catch {
    return { status: "failed" };
  }
}

export async function writeElderDeviceCookie(secret: string): Promise<void> {
  const store = await cookies();
  store.set(ELDER_DEVICE_COOKIE, secret, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: ELDER_DEVICE_COOKIE_PATH,
    maxAge: DEVICE_COOKIE_MAX_AGE_SECONDS,
  });
}

function toDevice(row: ActiveDeviceRow): ActiveElderDevice {
  return {
    id: row.id,
    accountId: row.accountId,
    careRecipientId: row.careRecipientId,
  };
}
