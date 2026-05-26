import multiResource from "../fixtures/multi-resource.json";
import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.describe("deep-link ?grouped=true", () => {
  test.beforeEach(({ msw }) => {
    msw.use(http.get(OTLP_URL, () => HttpResponse.json(multiResource)));
  });

  test("initial render reads searchParams and starts grouped without interaction", async ({
    page,
  }) => {
    await page.goto("/?grouped=true");

    await expect(page.getByTestId("group-by-toggle")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await expect(page.getByTestId("group")).toHaveCount(3);
    await expect(page.getByTestId("logs-count")).toHaveText(
      "9 logs · 3 services",
    );
  });
});
