import { expect, test } from "@playwright/test";

/**
 * Real Chromium keyboard input, not jsdom's polyfilled key-activation. Ported
 * from a live bug report: JAWS in Edge could open the menu (visually) but not
 * Tab into it, because JAWS's virtual buffer didn't notice the panel going
 * from hidden to visible until real focus moved inside it. This proves the
 * fix — opening moves focus to the first link — in an actual browser.
 */
test("Tab reaches the Menu button, Enter opens it and moves focus into the panel, Escape returns it", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // Menu button
  const btn = page.getByRole("button", { name: "Menu" });
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Know your rights" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();

  await page.keyboard.press("Space");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Know your rights" })).toBeFocused();
});
