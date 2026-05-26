import singleResource from "../fixtures/single-resource.json";
import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.describe("group-by-resource toggle", () => {
  test.beforeEach(({ msw }) => {
    msw.use(http.get(OTLP_URL, () => HttpResponse.json(singleResource)));
  });

  test("toggling group-by-resource updates the URL and renders a resource header", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("logs-count")).toHaveText("5 logs");

    const toggle = page.getByTestId("group-by-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();

    await expect(page).toHaveURL(/grouped=true/);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("group-header__title")).toHaveText(
      "playwright / fixture",
    );
    await expect(page.getByTestId("group-header__version")).toHaveText(
      "v1.0.0",
    );

    await toggle.click();

    await expect(page).not.toHaveURL(/grouped=true/);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });
});
