import { describe, expect, it } from "vitest";

import {
  buildSecurityHeaders,
  SECURITY_HEADER_KEYS,
} from "./security-headers";

function headerMap(isDev: boolean): Record<string, string> {
  return Object.fromEntries(
    buildSecurityHeaders({ isDev }).map((header) => [header.key, header.value]),
  );
}

describe("buildSecurityHeaders", () => {
  it("expõe os cinco headers A05 do SECURITY.md", () => {
    const keys = buildSecurityHeaders({ isDev: false }).map(
      (header) => header.key,
    );

    expect(keys).toEqual([...SECURITY_HEADER_KEYS]);
  });

  it("trava clickjacking, MIME sniffing, referrer e HSTS", () => {
    const headers = headerMap(false);

    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
  });

  it("libera só as origens que a Zelita usa no browser", () => {
    const csp = headerMap(false)["Content-Security-Policy"];

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("wss://*.supabase.co");
    expect(csp).toContain("https://*.ingest.sentry.io");
    expect(csp).not.toContain("\n");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it("permite eval só em desenvolvimento (Next.js)", () => {
    const csp = headerMap(true)["Content-Security-Policy"];

    expect(csp).toContain("'unsafe-eval'");
  });
});
