import singleResource from "../fixtures/single-resource.json";
import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.describe("row expand", () => {
  test.beforeEach(({ msw }) => {
    msw.use(http.get(OTLP_URL, () => HttpResponse.json(singleResource)));
  });

  test("clicking a row reveals body and resource details, clicking again collapses", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("logs-count")).toHaveText("5 logs");

    const rows = page.getByTestId("log-row");
    await expect(rows).toHaveCount(5);
    const firstRow = rows.first();
    const expandButton = firstRow.getByTestId("log-row__expand-button");
    await expect(expandButton).toHaveAttribute("aria-expanded", "false");

    await firstRow.click();

    await expect(expandButton).toHaveAttribute("aria-expanded", "true");
    const expanded = page.getByTestId("log-row__expanded");
    await expect(expanded).toBeVisible();
    await expect(expanded.getByText("playwright")).toBeVisible();

    await firstRow.click();

    await expect(expandButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("log-row__expanded")).toBeHidden();
  });
});
