#!/usr/bin/env node
/**
 * Compiles tokens/tokens.json into src/styles/tokens.css.
 *
 * Two jobs:
 *  1. Emit CSS custom properties: global tokens on :root, and one theme
 *     block per entry under `theme` (light is the default on :root; dark and
 *     highContrast are exposed as [data-theme="..."] and, for dark, via
 *     prefers-color-scheme when no explicit theme is set).
 *  2. Enforce contrast. Any color token that declares `$contrastAgainst`
 *     is checked against each named sibling using the WCAG 2.x relative
 *     luminance formula. If a pair falls below `$minRatio`, the build fails.
 *     This is the "accessibility is a build error, not a review comment" rule.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../tokens/tokens.json");
const out = resolve(here, "../src/styles/tokens.css");

const tokens = JSON.parse(readFileSync(src, "utf8"));

// ---------- contrast math (WCAG 2.x) ----------
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ---------- flatten non-theme tokens ----------
const lines = [];
const failures = [];

function kebab(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function walk(node, path, into) {
  for (const [key, val] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (val && typeof val === "object" && "value" in val) {
      into.push(`  --${[...path, key].map(kebab).join("-")}: ${val.value};`);
    } else if (val && typeof val === "object") {
      walk(val, [...path, key], into);
    }
  }
}

const globals = [];
for (const [group, node] of Object.entries(tokens)) {
  if (group.startsWith("$") || group === "theme") continue;
  walk(node, [group], globals);
}

// ---------- themes ----------
function themeBlock(name, theme) {
  const colors = theme.color;
  const out = [];
  for (const [key, def] of Object.entries(colors)) {
    if (key.startsWith("$")) continue;
    out.push(`  --color-${kebab(key)}: ${def.value};`);
    if (def.$contrastAgainst) {
      for (const other of def.$contrastAgainst) {
        const ratio = contrast(def.value, colors[other].value);
        const min = def.$minRatio ?? 4.5;
        if (ratio < min) {
          failures.push(
            `${name}: ${key} (${def.value}) on ${other} (${colors[other].value}) = ${ratio.toFixed(2)}:1, needs ${min}:1`,
          );
        }
      }
    }
  }
  return out;
}

const light = themeBlock("light", tokens.theme.light);
const dark = themeBlock("dark", tokens.theme.dark);
const hc = themeBlock("highContrast", tokens.theme.highContrast);

if (failures.length) {
  console.error("\nContrast check failed:\n  " + failures.join("\n  ") + "\n");
  process.exit(1);
}

lines.push("/* GENERATED FILE. Edit tokens/tokens.json and run `npm run tokens`. */");
lines.push(":root {");
lines.push("  color-scheme: light dark;");
lines.push(...globals);
lines.push(...light);
lines.push("}");
lines.push("");
lines.push("/* Dark: automatic when the OS asks for it and no explicit theme is set. */");
lines.push("@media (prefers-color-scheme: dark) {");
lines.push('  :root:not([data-theme]) {');
lines.push(...dark.map((l) => "  " + l));
lines.push("  }");
lines.push("}");
lines.push('[data-theme="dark"] {');
lines.push(...dark);
lines.push("}");
lines.push("");
lines.push('[data-theme="high-contrast"] {');
lines.push(...hc);
lines.push("  --size-border: var(--size-border-strong);");
lines.push("}");
lines.push("");
lines.push("/* Motion: reduced-motion users get instant transitions everywhere. */");
lines.push("@media (prefers-reduced-motion: reduce) {");
lines.push("  :root {");
lines.push("    --motion-duration-fast: 0ms;");
lines.push("    --motion-duration-base: 0ms;");
lines.push("  }");
lines.push("}");
lines.push("");

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"));
console.log(`tokens.css written (${globals.length} global, ${light.length} light, ${dark.length} dark, ${hc.length} high-contrast). All contrast pairs pass.`);
