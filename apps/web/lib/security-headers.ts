export interface SecurityHeader {
  key: string;
  value: string;
}

export interface BuildSecurityHeadersInput {
  isDev: boolean;
}

export const SECURITY_HEADER_KEYS = [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Strict-Transport-Security",
  "X-Frame-Options",
] as const;

const CONNECT_SRC = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://*.ingest.sentry.io",
  "https://*.ingest.us.sentry.io",
  "https://*.ingest.de.sentry.io",
  "https://*.sentry.io",
].join(" ");

function buildContentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.supabase.co",
    "font-src 'self'",
    `connect-src ${CONNECT_SRC}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function buildSecurityHeaders(
  input: BuildSecurityHeadersInput,
): SecurityHeader[] {
  return [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(input.isDev),
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
  ];
}

export { buildSecurityHeaders };
