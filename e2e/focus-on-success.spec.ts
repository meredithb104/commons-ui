import { expect, test } from "@playwright/test";

/**
 * Reported live: submitting a form threw focus back to the Menu button at the
 * top of the page. Root cause was in the demo, not a library component — both
 * Petition and MutualAidForm swap their submit button out for a plain success
 * Alert, which unmounts the focused button with nothing to catch the focus
 * that drops. JAWS's virtual cursor then resets to the top of the document,
 * landing on the first real control: the Menu button. Fixed with Alert's new
 * `autoFocus`. Real Chromium, since jsdom doesn't reproduce "focus falls off
 * an unmounted element" realistically enough to have caught this originally.
 */
test("signing the petition moves focus to the success message, not the Menu button", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add my name" }).click();
  const status = page.getByRole("status").filter({ hasText: "Your name was added" });
  await expect(status).toBeFocused();
});

test("submitting the mutual aid form moves focus to the success message, not the Menu button", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Your name" }).fill("Jordan");
  await page.getByRole("textbox", { name: "How can we reach you?" }).fill("555-0100");
  await page.getByRole("textbox", { name: "What do you need?" }).fill("A ride to a medical appointment next week.");
  await page.getByRole("button", { name: "Send request" }).click();
  const status = page.getByRole("status").filter({ hasText: "Request sent" });
  await expect(status).toBeFocused();
});
