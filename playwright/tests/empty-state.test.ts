import emptyFixture from "../fixtures/empty.json";
import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.describe("empty state", () => {
  test.beforeEach(({ msw }) => {
    msw.use(http.get(OTLP_URL, () => HttpResponse.json(emptyFixture)));
  });

  test("empty response renders the empty state and not the table", async ({
    page,
  }) => {
    await page.goto("/");

    const emptyState = page.getByTestId("empty-state");
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText("No logs found");
    await expect(emptyState).toContainText(/The API returned an empty response/);

    await expect(page.getByTestId("log-row")).toHaveCount(0);
    await expect(page.getByTestId("logs-count")).toBeHidden();
    await expect(page.getByTestId("histogram")).toBeHidden();
  });
});
