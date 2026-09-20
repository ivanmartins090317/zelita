import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import { buildSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: buildSecurityHeaders({
          isDev: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: {
    disable: true,
  },
  widenClientFileUpload: false,
});
