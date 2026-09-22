import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Valida X-Hub-Signature-256 da Meta antes de mutar estado.
 * Fail closed: header ausente ou secret vazio = inválido.
 */
export function isValidWhatsAppSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string | undefined,
): boolean {
  if (!appSecret || !signatureHeader) return false;
  const expected = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;
  if (!/^[0-9a-f]+$/i.test(expected) || expected.length !== 64) return false;

  const digest = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const left = Buffer.from(digest, "hex");
  const right = Buffer.from(expected, "hex");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
