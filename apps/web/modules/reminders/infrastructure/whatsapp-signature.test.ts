import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { isValidWhatsAppSignature } from "./whatsapp-signature";

const SECRET = "test-app-secret";
const BODY = '{"entry":[]}';

function sign(body: string, secret: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

describe("isValidWhatsAppSignature", () => {
  it("aceita HMAC válido", () => {
    expect(isValidWhatsAppSignature(BODY, sign(BODY, SECRET), SECRET)).toBe(
      true,
    );
  });

  it("recusa header, secret ou corpo errados", () => {
    expect(isValidWhatsAppSignature(BODY, sign(BODY, SECRET), "")).toBe(false);
    expect(isValidWhatsAppSignature(BODY, null, SECRET)).toBe(false);
    expect(isValidWhatsAppSignature(BODY, sign("outro", SECRET), SECRET)).toBe(
      false,
    );
    expect(isValidWhatsAppSignature(BODY, "sha256=abcd", SECRET)).toBe(false);
  });
});
