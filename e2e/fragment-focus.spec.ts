import { expect, test } from "@playwright/test";

/**
 * Reported live: activating a menu item that's a same-page link scrolled to the
 * target, but only visually — the target heading isn't natively focusable, so
 * nothing actually received focus. The next Tab or arrow key then restarted
 * keyboard navigation from the top of the document, landing back on the Menu
 * button, nowhere near where the user just navigated to. Real Chromium, since
 * this is about actual browser fragment-navigation focus behavior, not
 * something jsdom simulates.
 */
test("activating a menu item focuses its target heading, so the next Tab doesn't jump back to the Menu button", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await page.getByRole("menuitem", { name: "Petition" }).click();

  const heading = page.getByRole("heading", { name: "Petition: fix the curb cuts on Washington Street" });
  await expect(heading).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Menu" })).not.toBeFocused();
});
