import multiResource from "../fixtures/multi-resource.json";
import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.describe("grouped view (multi-resource)", () => {
  test.beforeEach(({ msw }) => {
    msw.use(http.get(OTLP_URL, () => HttpResponse.json(multiResource)));
  });

  test("toggling on renders one group per resource with the right header, version, and per-group count", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("logs-count")).toHaveText("9 logs");

    await page.getByTestId("group-by-toggle").click();

    await expect(page.getByTestId("logs-count")).toHaveText(
      "9 logs · 3 services",
    );

    // fetchLogs sorts by timeMs DESC, so group() encounters jobs/worker
    // first (its log has the latest timestamp), then api/billing-service,
    // then api/auth-service.
    const groups = page.getByTestId("group");
    await expect(groups).toHaveCount(3);

    await expect(groups.nth(0).getByTestId("group-header__title")).toHaveText(
      "jobs / worker",
    );
    await expect(groups.nth(0).getByTestId("group-header__version")).toHaveText(
      "v0.5.0",
    );
    await expect(groups.nth(0).getByTestId("group-header__count")).toHaveText(
      "4 logs",
    );

    await expect(groups.nth(1).getByTestId("group-header__title")).toHaveText(
      "api / billing-service",
    );
    await expect(groups.nth(1).getByTestId("group-header__version")).toHaveText(
      "v2.1.0",
    );
    await expect(groups.nth(1).getByTestId("group-header__count")).toHaveText(
      "2 logs",
    );

    await expect(groups.nth(2).getByTestId("group-header__title")).toHaveText(
      "api / auth-service",
    );
    await expect(groups.nth(2).getByTestId("group-header__version")).toHaveText(
      "v1.0.0",
    );
    await expect(groups.nth(2).getByTestId("group-header__count")).toHaveText(
      "3 logs",
    );

    // All groups start collapsed, so no log rows are visible.
    await expect(page.getByTestId("log-row")).toHaveCount(0);
  });

  test("expanding one group reveals only its rows", async ({ page }) => {
    await page.goto("/?grouped=true");

    const groups = page.getByTestId("group");
    await expect(groups).toHaveCount(3);

    // First group is jobs/worker (4 logs) — see ordering note above.
    const firstGroup = groups.nth(0);
    const firstHeader = firstGroup.getByTestId("group-header");

    await expect(firstHeader).toHaveAttribute("aria-expanded", "false");
    await expect(firstGroup.getByTestId("log-row")).toHaveCount(0);

    await firstHeader.click();

    await expect(firstHeader).toHaveAttribute("aria-expanded", "true");
    await expect(firstGroup.getByTestId("log-row")).toHaveCount(4);
    await expect(groups.nth(1).getByTestId("log-row")).toHaveCount(0);
    await expect(groups.nth(2).getByTestId("log-row")).toHaveCount(0);
    await expect(page.getByTestId("log-row")).toHaveCount(4);

    // Header count chip still reflects the underlying group size, not the
    // visible row count.
    await expect(firstGroup.getByTestId("group-header__count")).toHaveText(
      "4 logs",
    );

    await firstHeader.click();
    await expect(firstGroup.getByTestId("log-row")).toHaveCount(0);
  });
});
