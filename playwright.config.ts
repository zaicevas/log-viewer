import { defineConfig, devices } from "@playwright/test";

const PORT = 3030;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./playwright/tests",
  testMatch: "**/*.test.ts",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "blob" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    // A manually-started server won't have PW_TEST=true, so testProxy/MSW
    // interception won't be active — reuse would silently break the tests.
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PW_TEST: "true",
      LOGS_API_URL:
        "https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
