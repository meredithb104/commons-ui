/**
 * <cui-tabs>: the Tabs pattern without React (APG tabs, automatic activation).
 *
 * Progressive: the authored markup is a list of in-page links and the
 * sections they point at, which works as plain HTML. The element upgrades it:
 *
 *   <cui-tabs label="Carousel demo">
 *     <ul data-tabs>
 *       <li><a href="#demo">Demo</a></li>
 *       <li><a href="#notes" lang="es">Notas</a></li>
 *     </ul>
 *     <section id="demo"><h3 data-panel-heading>Demo</h3>…</section>
 *     <section id="notes" lang="es">…</section>
 *   </cui-tabs>
 *
 * With script: the list becomes role="tablist" of real <button role="tab">s
 * with aria-selected and aria-controls; one tab stop, Left/Right (or Up/Down
 * when orientation="vertical") move and select, Home/End jump; each section
 * becomes a focusable role="tabpanel" labelled by its tab; a panel heading
 * marked data-panel-heading is removed, because the tab now names the panel;
 * a link's lang is carried to its tab and panel (WCAG 3.1.2); a matching URL
 * fragment opens that panel on load. Each tab also gets aria-label mirroring
 * its text, for JAWS's element lists (see Tabs.tsx).
 *
 * Attributes: label (accessible name of the tablist, required), orientation
 * ("horizontal" default, or "vertical").
 * Events: cui-tab-change, bubbles, detail: { id } of the panel now shown.
 */
export class CuiTabs extends HTMLElement {
  private tabs: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];
  private tablist: HTMLElement | null = null;

  connectedCallback(): void {
    if (this.tabs.length > 0) return;
    const list = this.querySelector<HTMLElement>("[data-tabs]");
    if (!list) return;
    const links = [...list.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
    const panels = links
      .map((a) => this.querySelector<HTMLElement>(`#${CSS.escape(decodeURIComponent(a.hash.slice(1)))}`))
      .filter((p): p is HTMLElement => p !== null);
    if (panels.length === 0 || panels.length !== links.length) return;

    const vertical = this.getAttribute("orientation") === "vertical";
    this.classList.add("cui-tabs", vertical ? "cui-tabs--vertical" : "cui-tabs--horizontal");

    const tablist = document.createElement("div");
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", this.getAttribute("label") ?? "Tabs");
    tablist.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
    tablist.className = "cui-tabs__list";

    this.tabs = links.map((a, i) => {
      const panel = panels[i]!;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.id = `${panel.id}-tab`;
      tab.setAttribute("aria-controls", panel.id);
      const text = a.textContent?.trim() ?? "";
      tab.textContent = text;
      tab.setAttribute("aria-label", text);
      tab.className = "cui-tabs__tab";
      const lang = a.getAttribute("lang");
      if (lang) {
        tab.setAttribute("lang", lang);
        panel.setAttribute("lang", lang);
      }
      tab.addEventListener("click", () => this.activate(i, true));
      tablist.append(tab);

      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      panel.classList.add("cui-tabs__panel");
      panel.querySelector(":scope > [data-panel-heading]")?.remove();
      return tab;
    });
    this.panels = panels;
    this.tablist = tablist;
    list.replaceWith(tablist);
    tablist.addEventListener("keydown", this.onKeydown);

    const fromHash = panels.findIndex((p) => p.id === decodeURIComponent(location.hash.slice(1)));
    this.activate(fromHash === -1 ? 0 : fromHash, false, false);
  }

  disconnectedCallback(): void {
    this.tablist?.removeEventListener("keydown", this.onKeydown);
  }

  /** Index of the selected tab. */
  get selectedIndex(): number {
    return this.tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
  }

  /** Select a tab and show its panel. Focus moves to the tab for pointer activation and key moves. */
  activate(index: number, focusTab: boolean, notify = true): void {
    this.tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle("is-selected", selected);
      const panel = this.panels[i];
      if (panel) panel.hidden = !selected;
    });
    if (focusTab) this.tabs[index]?.focus();
    const id = this.panels[index]?.id;
    if (notify && id) this.dispatchEvent(new CustomEvent("cui-tab-change", { bubbles: true, detail: { id } }));
  }

  private readonly onKeydown = (event: KeyboardEvent): void => {
    const current = this.tabs.findIndex((t) => t === document.activeElement);
    if (current === -1) return;
    const vertical = this.getAttribute("orientation") === "vertical";
    const prev = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const count = this.tabs.length;
    let target: number | null = null;
    if (event.key === next) target = (current + 1) % count;
    else if (event.key === prev) target = (current - 1 + count) % count;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = count - 1;
    if (target === null) return;
    event.preventDefault();
    this.activate(target, true);
  };
}

if (!customElements.get("cui-tabs")) customElements.define("cui-tabs", CuiTabs);

declare global {
  interface HTMLElementTagNameMap {
    "cui-tabs": CuiTabs;
  }
  interface HTMLElementEventMap {
    "cui-tab-change": CustomEvent<{ id: string }>;
  }
}
