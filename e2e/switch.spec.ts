import { expect, test } from "@playwright/test";

/**
 * Real Chromium's aria snapshot, not jsdom. Reported live: Switch's Name/Role/Value
 * was inappropriate — the state text ("On"/"Off") was visible but not part of the
 * name, so Chromium exposed it as a second, stray value alongside aria-checked
 * instead. Fix: aria-labelledby now points at both the label and the state span,
 * so the name itself is "Plain language Off"/"Plain language On" — jsdom/axe never
 * catch this; it only shows up in a real accessibility tree.
 */
test("Switch's accessible name folds in the On/Off state", async ({ page }) => {
  await page.goto("/");
  const sw = page.getByRole("switch", { name: "Plain language Off" });
  await expect(sw).toHaveAccessibleName("Plain language Off");
  await sw.click();
  await expect(page.getByRole("switch", { name: "Plain language On" })).toHaveAccessibleName("Plain language On");
});
