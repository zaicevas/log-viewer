import {
  test as baseTest,
  expect,
  http,
  HttpResponse,
} from "next/experimental/testmode/playwright/msw";
import { defaultHandlers } from "./handlers";

// Auto-fixture installs the default OTLP mock + the unmocked-request warning
// catch-all on every test. Tests that need a per-test override should call
// `msw.use(...)` in a `beforeEach` — msw.use() prepends, so overrides win
// over the defaults installed here.
export const test = baseTest.extend<{ _mswDefaults: void }>({
  _mswDefaults: [
    async ({ msw }, use) => {
      msw.use(...defaultHandlers);
      await use();
    },
    { auto: true },
  ],
});

export { expect, http, HttpResponse };
