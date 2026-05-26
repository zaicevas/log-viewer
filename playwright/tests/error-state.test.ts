import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.describe("error state", () => {
  test.beforeEach(({ msw }) => {
    msw.use(
      http.get(OTLP_URL, () => new HttpResponse(null, { status: 500 })),
    );
  });

  test("API failure renders the error boundary", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("error-state")).toBeVisible();
    await expect(page.getByTestId("error-state__heading")).toHaveText(
      "Failed to load logs",
    );

    await expect(page.getByTestId("logs-count")).toBeHidden();
    await expect(page.getByTestId("histogram")).toBeHidden();
    await expect(page.getByTestId("log-row")).toHaveCount(0);
  });
});
