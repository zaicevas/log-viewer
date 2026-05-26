import { expect, test } from "../test";

test.describe("happy path", () => {
  test("renders the histogram, column headers, and a populated log table", async ({
    page,
  }) => {
    await page.goto("/");

    // Log-count header reflects the fixture (446 logs in default.json).
    await expect(page.getByTestId("logs-count")).toHaveText("446 logs");

    await expect(page.getByTestId("histogram")).toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "Severity" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Time (UTC)" }),
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Body" }),
    ).toBeVisible();

    await expect(page.getByTestId("log-row")).toHaveCount(446);
  });
});
