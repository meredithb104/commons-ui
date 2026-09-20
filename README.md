# Commons UI

**Accessible-by-default React components for organizers, advocates, and mutual-aid networks.**

Live demo: **https://meredithb104.github.io/commons-ui/** · Portfolio: **https://meredithb104.github.io/**

I'm a blind accessibility engineer who can also write the code she audits. I use JAWS and a braille display all day, every day, and I have spent six-plus years auditing other people's component libraries for the same dozen mistakes. This is the library from which I wanted them to have started: small, opinionated, and built so that the accessible path is the only path.

The demo content is real civic work: a Know Your Rights guide with a plain-language switch, a mutual-aid request form, a curb-cut petition, a barrier-report dialog, and multilingual resources. Nothing is lorem ipsum, because you can't judge a form component on fake fields.

## Principles

1. **Accessibility is a build error, not a review comment.** The design tokens declare which colors sit on which backgrounds and the contrast ratio they need. `npm run tokens` computes every pair with the WCAG 2.x formula and refuses to emit CSS if any pair fails. You cannot ship a low-contrast theme by accident.
2. **Use the platform before you use ARIA.** Real `<button>`s, real `<label>`s, native `<dialog>` for the modal (inert backdrop, Escape, top layer, all free). ARIA only where HTML has no answer: `role="switch"`, `role="tablist"`, `aria-expanded`.
3. **Focus goes where the user's attention should go.** Error summaries take focus. Dialogs move focus in and give it back. Nothing is `disabled` when `aria-busy` will do, because disabled controls vanish from the tab order and go silent.
4. **Never color alone.** Every state (on/off, error, success) is also text. Every icon is `aria-hidden` next to a label.
5. **Test the behavior, not just the markup.** axe-core catches missing names and bad roles. It cannot tell you that focus went nowhere on submit. Both kinds of test are in `src/lib/__tests__`.

## Components

| Component | Pattern | What it gets right |
| --- | --- | --- |
| `Accordion` / `AccordionItem` | [APG accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) | Real headings containing real buttons; `aria-expanded`/`aria-controls`; Up/Down/Home/End between headers |
| `Tabs` | [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), automatic activation | Roving tabindex; arrow keys; per-tab `lang` so screen readers switch voice (WCAG 3.1.2); focusable panels |
| `Dialog` | native `<dialog>` | Focus in on open, back to opener on close (2.4.3); labelled by title; backdrop click and Escape close |
| `Switch` | [APG switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) | `role="switch"` on a real button; visible On/Off text (1.4.1); Space/Enter |
| `TextField` (+ `multiline`) | labelled input | `aria-describedby` chains hint then error; `aria-invalid`; required announced in text, not just `*` |
| `FormErrorSummary` | [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/) | `role="alert"`, takes focus on submit, each error links to and focuses its field (3.3.1, 3.3.3) |
| `ProgressMeter` | `role="progressbar"` | `aria-valuetext` in human words ("1,387 of 2,000 signatures"); fill/track contrast enforced by tokens |
| `Button` | `<button>` | 44px target; `loading` uses `aria-busy` + `aria-disabled` so focus is never lost |
| `Alert` | `role="alert"` / `role="status"` | Errors interrupt, everything else waits; tone is written as text |
| `MenuButton` | [APG button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) ("hamburger" toggle) | Named by its own visible text, not an icon alone; `aria-expanded`/`aria-controls`; 44px target; same spec as the portfolio site's hamburger, contrast-checked by Playwright |
| `LiveRegionProvider` / `useAnnouncer` | live regions | Mounted empty at app start (regions that mount with content are silent); polite and assertive channels |
| `SkipLink`, `VisuallyHidden` | utilities | 2.4.1 bypass blocks; screen-reader-only text |

## Tokens

`tokens/tokens.json` is the source of truth. `scripts/build-tokens.mjs` compiles it to `src/styles/tokens.css`:

- global scales (type, space, radius, motion, target size) on `:root`
- three themes: **light** (default), **dark** (`[data-theme="dark"]`, or automatic via `prefers-color-scheme` when no theme is set), **high-contrast** (`[data-theme="high-contrast"]`, thicker borders)
- `prefers-reduced-motion` zeroes every duration token
- `forced-colors` handled in CSS with system colors so Windows High Contrast users get real outlines and highlights

Any color token can declare what it sits on and the ratio it needs:

```json
"focus": { "value": "#B54708", "$contrastAgainst": ["bg", "surface", "bgSubtle"], "$minRatio": 3 }
```

Drop below the ratio and the build stops:

```
Contrast check failed:
  light: textMuted (#8A96A3) on bg (#FFFFFF) = 2.98:1, needs 4.5:1
```

## Run it

```bash
npm install
npm run dev        # compiles tokens, starts Vite
npm test           # compiles tokens, runs Vitest + Testing Library + axe-core
npm run test:e2e   # builds, then runs Playwright against the built demo page
npm run build      # tokens -> typecheck -> production build
```

## Testing approach

Each component has:

- **behavior tests** with `@testing-library/user-event`: keyboard navigation, focus movement, ARIA state changes, the things a screen reader user would notice first
- **an axe-core scan** asserting zero violations

axe's `color-contrast` rule is disabled in jsdom (no layout, no paint) because contrast is already enforced upstream by the token build. That is the right place for it: a contrast failure is a design-token bug, not a component bug.

`e2e/contrast.spec.ts` (Playwright, real Chromium) checks what jsdom can't: rendered contrast. It proves the focus ring reaches 3:1 against whatever it actually borders for every focusable element, and that `MenuButton` keeps its text at 4.5:1 and its border at 3:1 in default, hover, and expanded states, across light and dark. Ported from the equivalent check on [meredithb104.github.io](https://github.com/meredithb104/meredithb104.github.io), which `MenuButton`'s spec (44px target, surface/border/text tokens, expanded-state color) matches.

## What's not here yet

- No Storybook. The demo page is the playground for now.
- No motion beyond transitions. Reduced motion is respected, but there's nothing to reduce.
- No combobox, menu, or date picker. Those are the next hard ones.

## License

MIT. Use it for something that matters.
