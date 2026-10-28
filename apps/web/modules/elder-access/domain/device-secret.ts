import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { DEVICE_TOKEN_BYTES } from "@/modules/elder-access/domain/device-link";

export function createDeviceToken(): string {
  return randomBytes(DEVICE_TOKEN_BYTES).toString("base64url");
}

export function hashDeviceSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function deviceSecretsMatch(leftHex: string, rightHex: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(leftHex) || !/^[a-f0-9]{64}$/i.test(rightHex)) {
    return false;
  }
  const left = Buffer.from(leftHex, "hex");
  const right = Buffer.from(rightHex, "hex");
  return timingSafeEqual(left, right);
}
