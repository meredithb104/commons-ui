import { expect, test } from "@playwright/test";

/**
 * Real Chromium keyboard input, not jsdom's polyfilled key-activation. Ported
 * from a live bug report: JAWS in Edge could open the menu (visually) but not
 * Tab into it, because JAWS's virtual buffer didn't notice the panel going
 * from hidden to visible until real focus moved inside it. This proves the
 * fix — opening moves focus to the first menu item — in an actual browser.
 * The items are role="menuitem" (not "link"): that's the other half of
 * aria-haspopup="menu" on the button — JAWS only hands arrow keys to the page
 * for elements it treats as a real widget.
 */
test("Tab reaches the Menu button, Enter opens it and moves focus into the menu, Escape returns it", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // Menu button
  const btn = page.getByRole("button", { name: "Menu" });
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Enter");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menuitem", { name: "Know your rights" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(btn).toHaveAttribute("aria-expanded", "false");
  await expect(btn).toBeFocused();

  await page.keyboard.press("Space");
  await expect(btn).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menuitem", { name: "Know your rights" })).toBeFocused();
});

test("Arrow keys move between menu items, and Home/End jump to the ends", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();

  const items = ["Know your rights", "Petition", "Mutual aid", "Report a barrier", "Resources"].map((name) =>
    page.getByRole("menuitem", { name }),
  );
  await expect(items[0]!).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(items[1]!).toBeFocused();

  await page.keyboard.press("End");
  await expect(items[4]!).toBeFocused();

  await page.keyboard.press("ArrowDown"); // wraps
  await expect(items[0]!).toBeFocused();

  await page.keyboard.press("ArrowUp"); // wraps the other way
  await expect(items[4]!).toBeFocused();

  await page.keyboard.press("Home");
  await expect(items[0]!).toBeFocused();
});
