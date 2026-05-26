import { expect, test } from "../test";

test.use({
  permissions: ["clipboard-read", "clipboard-write"],
});

test.describe("copy as prompt", () => {
  test("clicking the button copies a markdown investigation prompt and updates data-copied", async ({
    page,
  }) => {
    await page.goto("/");

    const firstRow = page.getByTestId("log-row").first();
    await firstRow.click();

    await expect(page.getByTestId("log-row__expanded")).toBeVisible();

    const button = page.getByTestId("copy-prompt-button");
    await expect(button).toHaveAttribute("data-state", "idle");

    await button.click();

    // `data-state="copied"` is itself proof that writeText resolved — the
    // component's setCopied(true) only fires in the .then() of the promise.
    // If permissions weren't granted, this would stay "idle" and the test
    // would fail here, before we ever read the clipboard.
    await expect(button).toHaveAttribute("data-state", "copied");

    const copied = await page.evaluate(() => navigator.clipboard.readText());

    // Markdown, not JSON — the regression we care about (the button used to
    // copy JSON.stringify(log, null, 2)).
    expect(copied.startsWith("{")).toBe(false);
    expect(copied).toContain(
      "I'm investigating a single log entry from an OpenTelemetry (OTLP) backend.",
    );

    // Structural markers — fixture-agnostic so the test stays green regardless
    // of which log was clicked or what `USE_MOCK` in fetch-logs.ts is set to.
    expect(copied).toContain("## The log");
    expect(copied).toContain("**Time:**");
    expect(copied).toContain("**Severity:**");
    expect(copied).toContain("- **Body:**");
    expect(copied).toContain("## Questions");
    expect(copied).toContain(
      "In plain terms, what is this log most likely telling me?",
    );

    // Body lives inside a fenced code block (opening and closing fences).
    const fenceCount = copied.match(/```/g)?.length ?? 0;
    expect(fenceCount).toBeGreaterThanOrEqual(2);

    // State returns to "idle" after the 1.5s timeout in useCopyToClipboard —
    // well within Playwright's default 5s assertion timeout.
    await expect(button).toHaveAttribute("data-state", "idle");
  });
});
