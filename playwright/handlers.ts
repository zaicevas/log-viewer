import {
  http,
  HttpResponse,
  type RequestHandler,
} from "next/experimental/testmode/playwright/msw";
import defaultFixture from "./fixtures/default.json";

// Pinned to the URL set in playwright.config.ts. Exported so per-test
// overrides can use the same constant instead of redeclaring the pattern.
export const OTLP_URL =
  "https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs";

// Lowest-priority handler: any request reaching it is unmocked. Returning
// undefined makes MSW treat it as passthrough (onPassthroughResponse →
// 'continue' in next/experimental/testmode/playwright/msw), so the real
// fetch still goes through — the warning just makes the leak visible.
const warnOnUnmocked: RequestHandler = http.all("*", ({ request }) => {
  console.warn(
    `[playwright/msw] unmocked request leaked to real network: ${request.method} ${request.url}`,
  );
  return undefined;
});

// Installed for every test via the auto-fixture in `./test.ts`. msw.use()
// prepends, so per-test overrides (msw.use(...) in a beforeEach) land in
// front of the OTLP default while the catch-all stays at the bottom.
export const defaultHandlers: RequestHandler[] = [
  http.get(OTLP_URL, () => HttpResponse.json(defaultFixture)),
  warnOnUnmocked,
];
