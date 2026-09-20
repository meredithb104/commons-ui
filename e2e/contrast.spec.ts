import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Rendered contrast, not declared contrast. The token build (scripts/build-tokens.mjs)
 * proves the pairs tokens declare; this proves what the browser actually draws: the
 * focus ring against what it borders, for every focusable kind, and MenuButton's text
 * and border across its default, hover, and expanded states. Ported from the same
 * checks in meredithb104.github.io (e2e/contrast-states.spec.ts), which MenuButton's
 * spec (44px target, surface/border/text tokens, expanded-state color) is copied from.
 */

function lum([r, g, b]: number[]): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
}
function ratio(a: number[], b: number[]): number {
  const [x, y] = [lum(a), lum(b)].toSorted((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

/** The demo has no localStorage theme hook to pre-set; switch it through its own radios. */
async function setTheme(page: Page, label: "Light" | "Dark" | "High contrast"): Promise<void> {
  await page.getByRole("radio", { name: label }).check();
}

const THEMES = ["Light", "Dark", "High contrast"] as const;

for (const theme of THEMES) {
  test(`${theme}: focus ring reaches 3:1 against what it borders, for every focusable kind`, async ({ page }) => {
    await page.goto("/");
    await setTheme(page, theme);
    await page.getByRole("button", { name: "Menu" }).click();
    const rings = await page.evaluate(() => {
      const toRgb = (s: string) => {
        const c = document.createElement("canvas").getContext("2d")!;
        c.fillStyle = s;
        const h = c.fillStyle as string;
        return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      };
      const bgOf = (e0: Element | null) => {
        let e = e0;
        while (e) {
          const c = getComputedStyle(e).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return toRgb(c);
          e = e.parentElement;
        }
        return [255, 255, 255];
      };
      const ring = toRgb(getComputedStyle(document.documentElement).getPropertyValue("--color-focus").trim());
      const out: { kind: string; ring: number[]; adjacent: number[] }[] = [];
      const seen = new Set<string>();
      for (const el of document.querySelectorAll<HTMLElement>("a[href], button, input, textarea, [tabindex='0']")) {
        if (el.offsetParent === null && !el.matches(".cui-skip-link")) continue;
        const cs = getComputedStyle(el);
        const offset = parseFloat(cs.outlineOffset);
        // A ring outside the box (offset >= 0) borders the parent's background; inside, the element's own.
        const adjacent = offset >= 0 || cs.backgroundColor === "rgba(0, 0, 0, 0)" ? bgOf(el.parentElement) : toRgb(cs.backgroundColor);
        const kind = `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}@${adjacent.join(",")}`;
        if (seen.has(kind)) continue;
        seen.add(kind);
        out.push({ kind, ring, adjacent });
      }
      return out;
    });
    expect(rings.length).toBeGreaterThan(8);
    const bad = rings.map((r) => ({ ...r, ratio: ratio(r.ring, r.adjacent) })).filter((r) => r.ratio < 3);
    expect(bad, JSON.stringify(bad)).toEqual([]);
  });
}

for (const theme of THEMES) {
  test(`${theme}: MenuButton keeps text at 4.5:1 and a 3:1 boundary in default, hover, and expanded states`, async ({ page }) => {
    await page.goto("/");
    await setTheme(page, theme);
    const button = page.getByRole("button", { name: "Menu" });

    const measure = () =>
      button.evaluate((el) => {
        const toRgb = (s: string) => {
          const c = document.createElement("canvas").getContext("2d")!;
          c.fillStyle = s;
          const h = c.fillStyle as string;
          return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
        };
        const bgOf = (e0: Element | null) => {
          let e = e0;
          while (e) {
            const c = getComputedStyle(e).backgroundColor;
            if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return toRgb(c);
            e = e.parentElement;
          }
          return [255, 255, 255];
        };
        const cs = getComputedStyle(el);
        const own = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent" ? toRgb(cs.backgroundColor) : null;
        return {
          fg: toRgb(cs.color),
          own,
          surround: bgOf(el.parentElement),
          border: toRgb(cs.borderTopColor),
          bw: parseFloat(cs.borderTopWidth),
        };
      });

    const check = (label: string, m: Awaited<ReturnType<typeof measure>>, failures: string[]) => {
      const bg = m.own ?? m.surround;
      const textR = ratio(m.fg, bg);
      const boundary = Math.max(m.own ? ratio(m.own, m.surround) : 0, m.bw > 0 ? ratio(m.border, m.surround) : 0);
      if (textR < 4.5 || boundary < 3) failures.push(`${label}: text ${textR.toFixed(2)}, boundary ${boundary.toFixed(2)}`);
    };

    const failures: string[] = [];
    await page.mouse.move(0, 0);
    await page.waitForTimeout(80);
    check("default", await measure(), failures);

    await button.hover();
    await page.waitForTimeout(80);
    check("hover", await measure(), failures);

    await button.click(); // opens the nav: aria-expanded="true"
    await page.mouse.move(0, 0);
    await page.waitForTimeout(80);
    check("expanded", await measure(), failures);

    expect(failures).toEqual([]);

    const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(results.violations).toEqual([]);
  });
}
