/**
 * <cui-menu-button>: the MenuButton pattern without React.
 *
 * The same component as `MenuButton.tsx`, for pages that ship no framework:
 * a real <button type="button"> in the light DOM, named by its visible text,
 * with aria-expanded for state and aria-controls naming the panel it opens.
 * While open, Escape closes and returns focus to the button, and a pointer
 * down outside the button and its panel closes without stealing focus.
 * Styles come from `styles/menu-button.css`, shared with the React version.
 *
 *   <cui-menu-button label="More information" controls="more-list"></cui-menu-button>
 *   <ul id="more-list" hidden>…</ul>
 *
 * Attributes
 *   label     the visible text and accessible name (required)
 *   controls  id of the element the button opens (aria-controls; also the
 *             region an outside click is measured against)
 *   open      present while open; reflected from the `open` property
 *   variant   "quiet" for a boxless button that sits among links; the
 *             expanded state is then a tint plus bold text
 *
 * Events
 *   cui-open-change  bubbles; detail: { open: boolean }. Fired when the user
 *                    toggles or closes the menu. The consumer shows and hides
 *                    the panel; the element never touches it.
 */

const ICON =
  '<svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h14M3 10h14M3 15h14"/></svg>';

export class CuiMenuButton extends HTMLElement {
  static readonly observedAttributes = ["open", "label", "controls", "variant"];

  private button: HTMLButtonElement | null = null;
  private label: HTMLSpanElement | null = null;

  connectedCallback(): void {
    if (!this.button) this.render();
    this.sync();
  }

  disconnectedCallback(): void {
    this.unlisten();
  }

  attributeChangedCallback(): void {
    if (this.button) this.sync();
  }

  /** Whether the menu is open. Setting it reflects to the attribute and updates aria-expanded. */
  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    if (value === this.open) return;
    this.toggleAttribute("open", value);
  }

  /** The inner <button>, for focus() or for a consumer that needs the element itself. */
  get control(): HTMLButtonElement | null {
    return this.button;
  }

  private render(): void {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cui-menu-button";
    button.innerHTML = `${ICON} <span class="cui-menu-button__label"></span>`;
    button.addEventListener("click", () => this.request(!this.open));
    this.label = button.querySelector("span");
    this.button = button;
    this.replaceChildren(button);
  }

  /** Attributes to DOM: name, controls, variant, and the expanded state, plus the document listeners while open. */
  private sync(): void {
    if (!this.button || !this.label) return;
    const label = this.getAttribute("label") ?? "";
    this.label.textContent = label;
    this.label.dataset["label"] = label; // the quiet variant reserves the bold width from this
    const controls = this.getAttribute("controls");
    if (controls) this.button.setAttribute("aria-controls", controls);
    else this.button.removeAttribute("aria-controls");
    this.button.classList.toggle("cui-menu-button--quiet", this.getAttribute("variant") === "quiet");
    this.button.setAttribute("aria-expanded", this.open ? "true" : "false");
    if (this.open) this.listen();
    else this.unlisten();
  }

  /** The user asked for a change: reflect it, then tell the consumer. */
  private request(open: boolean): void {
    this.open = open;
    this.dispatchEvent(new CustomEvent("cui-open-change", { bubbles: true, detail: { open } }));
  }

  private listening = false;

  private listen(): void {
    if (this.listening) return;
    this.listening = true;
    document.addEventListener("keydown", this.onKeydown);
    document.addEventListener("pointerdown", this.onPointerDown);
  }

  private unlisten(): void {
    if (!this.listening) return;
    this.listening = false;
    document.removeEventListener("keydown", this.onKeydown);
    document.removeEventListener("pointerdown", this.onPointerDown);
  }

  private isInside(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    if (this.contains(target)) return true;
    const controls = this.getAttribute("controls");
    const panel = controls ? document.getElementById(controls) : null;
    return panel?.contains(target) ?? false;
  }

  private readonly onKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.open) return;
    event.preventDefault();
    this.request(false);
    this.button?.focus();
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (this.open && !this.isInside(event.target)) this.request(false);
  };
}

if (!customElements.get("cui-menu-button")) customElements.define("cui-menu-button", CuiMenuButton);

declare global {
  interface HTMLElementTagNameMap {
    "cui-menu-button": CuiMenuButton;
  }
  interface HTMLElementEventMap {
    "cui-open-change": CustomEvent<{ open: boolean }>;
  }
}
