import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    // Gated on PW_TEST, which is set by playwright.config.ts webServer.env. A
    // manually-started `next dev` won't have it, so testProxy stays off in
    // normal local dev and only activates for the Playwright-driven server.
    testProxy: process.env.PW_TEST === "true",
  },
};

export default nextConfig;
