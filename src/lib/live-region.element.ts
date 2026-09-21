/**
 * <cui-live-region> and announce(): the LiveRegionProvider pattern without React.
 *
 * One pair of live regions for the whole page, mounted once and always present,
 * because a region that mounts with its message already inside is silent in
 * most screen readers. Put the element anywhere in <body> (it is visually
 * hidden), or let announce() create it on first use:
 *
 *   <cui-live-region></cui-live-region>
 *   …
 *   import { announce } from "commons-ui/element";
 *   announce("Showing 2 of 5 projects");            // polite
 *   announce("Your session is ending", "assertive"); // rarely
 *
 * Each message clears the region first and sets the text 30 ms later, so an
 * identical message announces again and the mutation is observed as a change.
 */
export type Politeness = "polite" | "assertive";

export class CuiLiveRegion extends HTMLElement {
  private polite: HTMLDivElement | null = null;
  private assertive: HTMLDivElement | null = null;
  private timers: Record<Politeness, number> = { polite: 0, assertive: 0 };

  connectedCallback(): void {
    if (this.polite) return;
    this.polite = this.region("polite");
    this.assertive = this.region("assertive");
    this.replaceChildren(this.polite, this.assertive);
  }

  private region(politeness: Politeness): HTMLDivElement {
    const div = document.createElement("div");
    div.className = "cui-visually-hidden";
    div.setAttribute("aria-live", politeness);
    div.setAttribute("aria-atomic", "true");
    return div;
  }

  announce(message: string, politeness: Politeness = "polite"): void {
    const target = politeness === "assertive" ? this.assertive : this.polite;
    if (!target) return;
    target.textContent = "";
    window.clearTimeout(this.timers[politeness]);
    this.timers[politeness] = window.setTimeout(() => {
      target.textContent = message;
    }, 30);
  }
}

if (!customElements.get("cui-live-region")) customElements.define("cui-live-region", CuiLiveRegion);

/** Announce through the page's <cui-live-region>, creating it at the end of <body> if it is missing. */
export function announce(message: string, politeness: Politeness = "polite"): void {
  let region = document.querySelector("cui-live-region");
  if (!region) {
    region = document.createElement("cui-live-region");
    document.body.append(region);
  }
  region.announce(message, politeness);
}

declare global {
  interface HTMLElementTagNameMap {
    "cui-live-region": CuiLiveRegion;
  }
}
