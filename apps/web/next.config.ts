import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* Scaffold: opções de produto entram nas Specs seguintes. Redeploy trigger. */
};

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: {
    disable: true,
  },
  widenClientFileUpload: false,
});
