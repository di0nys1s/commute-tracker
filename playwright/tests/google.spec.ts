import { test, expect } from "@playwright/test";

test("Google search shows results page", async ({ page }) => {
  await page.goto("https://www.google.com");

  // Try to accept cookie banners if present (best-effort, ignore errors)
  const possibleButtons = [
    'button:has-text("I agree")',
    'button:has-text("Accept all")',
    'button:has-text("Accept")',
    'div[role="dialog"] button:has-text("I agree")',
  ];
  for (const selector of possibleButtons) {
    const el = await page.$(selector);
    if (el) {
      try {
        await el.click({ timeout: 1000 });
        break;
      } catch {
        // ignore
      }
    }
  }

  // Be resilient to regional UX variations: try multiple selectors, then fallback to direct query URL
  const searchInput = page
    .locator('input[title="Search"], textarea[name="q"], input[name="q"]')
    .first();
  try {
    await searchInput.waitFor({ state: "visible", timeout: 15000 });
    await searchInput.fill("playwright");
    await page.keyboard.press("Enter");
  } catch {
    await page.goto("https://www.google.com/search?q=playwright");
  }

  await expect(page).toHaveURL(/google\.[^/]+\/search/);
  await expect(page.locator("body")).toContainText(/playwright/i);

  // Keep browser open for manual inspection when requested
  if (process.env.KEEP_BROWSER_OPEN === "1") {
    // eslint-disable-next-line playwright/no-skipped-test
    await page.pause();
  }
});
