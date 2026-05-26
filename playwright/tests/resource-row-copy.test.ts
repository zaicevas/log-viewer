import singleResource from "../fixtures/single-resource.json";
import { OTLP_URL } from "../handlers";
import { expect, http, HttpResponse, test } from "../test";

test.use({
  permissions: ["clipboard-read", "clipboard-write"],
});

test.describe("resource-row copy button", () => {
  test.beforeEach(({ msw }) => {
    msw.use(http.get(OTLP_URL, () => HttpResponse.json(singleResource)));
  });

  test("copies the raw value, transitions data-state, and exposes the value via title", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("log-row").first().click();
    const expanded = page.getByTestId("log-row__expanded");
    await expect(expanded).toBeVisible();

    const buttons = expanded.getByTestId("resource-row__copy-button");
    // Logs sort descending; the first displayed row is the TRACE "shutdown
    // sequence" record with no per-log attributes → no Attributes card → 9
    // ResourceRows (4 Log + 3 Service + 2 Scope).
    await expect(buttons).toHaveCount(9);
    const labels = await buttons.evaluateAll((els) =>
      els.map((el) => el.getAttribute("aria-label")),
    );
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels).toContain("Copy service.name");

    const copyButton = expanded.getByRole("button", {
      name: "Copy service.name",
      exact: true,
    });
    await expect(copyButton).toHaveAttribute("data-state", "idle");

    await copyButton.click();
    // `data-state="copied"` is itself proof writeText resolved — setCopied(true)
    // only fires in the .then() of the clipboard promise.
    await expect(copyButton).toHaveAttribute("data-state", "copied");

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe("fixture");

    await expect(copyButton).toHaveAttribute("data-state", "idle");

    await expect(expanded.locator('span[title="fixture"]')).toHaveText(
      "fixture",
    );
  });
});
