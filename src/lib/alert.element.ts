/**
 * <cui-alert>: the Alert pattern without React.
 *
 *   <cui-alert tone="error" title="Check the form">Two fields need attention.</cui-alert>
 *   <cui-alert tone="success">Saved.</cui-alert>
 *
 * - tone="error" renders role="alert" (assertive, because errors block the user);
 *   every other tone renders role="status" (polite).
 * - The tone is written as text ("Error:", "Success:", "Note:") for screen readers, so
 *   it never relies on colour or an icon alone (1.4.1).
 * - The authored children become the body. Set the `message` property to replace the
 *   body text, for a status line a script updates.
 *
 * Attributes: tone ("info" default, "success", "error"), title (defaults to the tone word).
 */
type Tone = "info" | "success" | "error";

const PREFIX: Record<Tone, string> = { info: "Note", success: "Success", error: "Error" };

export class CuiAlert extends HTMLElement {
  static readonly observedAttributes = ["tone", "title"];

  private box: HTMLDivElement | null = null;
  private titleEl: HTMLParagraphElement | null = null;
  private body: HTMLDivElement | null = null;

  connectedCallback(): void {
    if (!this.box) this.render();
    this.sync();
  }

  attributeChangedCallback(): void {
    if (this.box) this.sync();
  }

  get tone(): Tone {
    const t = this.getAttribute("tone");
    return t === "success" || t === "error" ? t : "info";
  }

  /** Replace the body text. */
  set message(text: string) {
    if (this.body) this.body.textContent = text;
  }

  get message(): string {
    return this.body?.textContent ?? "";
  }

  private render(): void {
    const box = document.createElement("div");
    const title = document.createElement("p");
    title.className = "cui-alert__title";
    const body = document.createElement("div");
    body.className = "cui-alert__body";
    body.append(...this.childNodes);
    box.append(title, body);
    this.replaceChildren(box);
    this.box = box;
    this.titleEl = title;
    this.body = body;
  }

  private sync(): void {
    if (!this.box || !this.titleEl) return;
    const tone = this.tone;
    this.box.setAttribute("role", tone === "error" ? "alert" : "status");
    this.box.className = `cui-alert cui-alert--${tone}`;
    const prefix = document.createElement("span");
    prefix.className = "cui-visually-hidden";
    prefix.textContent = `${PREFIX[tone]}: `;
    // `title` is also the native tooltip attribute; read it once and keep it off the host.
    const heading = this.getAttribute("title") ?? PREFIX[tone];
    if (this.hasAttribute("title")) {
      this.dataset["title"] = heading;
      this.removeAttribute("title");
    }
    this.titleEl.replaceChildren(prefix, this.dataset["title"] ?? heading);
  }
}

if (!customElements.get("cui-alert")) customElements.define("cui-alert", CuiAlert);

declare global {
  interface HTMLElementTagNameMap {
    "cui-alert": CuiAlert;
  }
}
