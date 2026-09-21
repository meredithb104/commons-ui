/**
 * <cui-text-field>: the TextField pattern without React.
 *
 *   <cui-text-field label="Text color" hint="Hex, like #1B1F24" name="fg" value="#1B1F24" required></cui-text-field>
 *
 * Renders, in the light DOM, the whole WCAG form pattern:
 * - a visible <label> associated by id (1.3.1, 3.3.2)
 * - a hint and an error joined through aria-describedby in reading order (hint, then error)
 * - aria-invalid while there is an error (3.3.1); the error text is prefixed "Error:" for screen readers
 * - required said in text ("(required)"), never by the asterisk alone
 * - stable ids (<id>-hint, <id>-error) so an error summary can link to the field
 *
 * Attributes: label (required), hint, error, name, value, type (default "text"), placeholder,
 * autocomplete, inputmode, pattern, required, multiline (renders a <textarea>), rows, id (used for
 * the input; generated when absent). Set `error` to a message to mark the field invalid and clear
 * it (remove the attribute or set it empty) to restore.
 * Properties: `input` (the <input> or <textarea>), `value`, `error`.
 */
let counter = 0;

export class CuiTextField extends HTMLElement {
  static readonly observedAttributes = ["label", "hint", "error", "required", "value", "placeholder"];

  private wrapper: HTMLElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private hintEl: HTMLParagraphElement | null = null;
  private errorEl: HTMLParagraphElement | null = null;
  private control: HTMLInputElement | HTMLTextAreaElement | null = null;

  connectedCallback(): void {
    if (!this.control) this.render();
    this.sync();
  }

  attributeChangedCallback(): void {
    if (this.control) this.sync();
  }

  get input(): HTMLInputElement | HTMLTextAreaElement | null {
    return this.control;
  }

  get value(): string {
    return this.control?.value ?? this.getAttribute("value") ?? "";
  }

  set value(v: string) {
    if (this.control) this.control.value = v;
    else this.setAttribute("value", v);
  }

  get error(): string {
    return this.getAttribute("error") ?? "";
  }

  set error(message: string) {
    if (message) this.setAttribute("error", message);
    else this.removeAttribute("error");
  }

  private render(): void {
    const id = this.getAttribute("id-for-input") ?? this.getAttribute("field-id") ?? `cui-field-${++counter}`;
    const multiline = this.hasAttribute("multiline");
    const control = multiline ? document.createElement("textarea") : document.createElement("input");
    control.id = id;
    control.className = "cui-field__input";
    if (control instanceof HTMLInputElement) control.type = this.getAttribute("type") ?? "text";
    if (control instanceof HTMLTextAreaElement && this.hasAttribute("rows")) control.rows = Number(this.getAttribute("rows"));
    for (const attr of ["name", "autocomplete", "inputmode", "pattern", "spellcheck", "maxlength"]) {
      const v = this.getAttribute(attr);
      if (v !== null) control.setAttribute(attr, v);
    }
    const initial = this.getAttribute("value");
    if (initial !== null) control.value = initial;

    const label = document.createElement("label");
    label.className = "cui-field__label";
    label.htmlFor = id;

    const hint = document.createElement("p");
    hint.className = "cui-field__hint";
    hint.id = `${id}-hint`;

    const error = document.createElement("p");
    error.className = "cui-field__error";
    error.id = `${id}-error`;

    const wrapper = document.createElement("div");
    wrapper.className = "cui-field";
    wrapper.append(label, hint, error, control);
    this.replaceChildren(wrapper);
    this.wrapper = wrapper;
    this.labelEl = label;
    this.hintEl = hint;
    this.errorEl = error;
    this.control = control;
  }

  private sync(): void {
    const { labelEl, hintEl, errorEl, control, wrapper } = this;
    if (!labelEl || !hintEl || !errorEl || !control || !wrapper) return;
    const required = this.hasAttribute("required");
    labelEl.replaceChildren(this.getAttribute("label") ?? "");
    if (required) {
      const mark = document.createElement("span");
      mark.className = "cui-field__required";
      mark.innerHTML = ' <span aria-hidden="true">*</span><span class="cui-visually-hidden">(required)</span>';
      labelEl.append(mark);
    }
    control.required = required;

    const hintText = this.getAttribute("hint") ?? "";
    hintEl.textContent = hintText;
    hintEl.hidden = hintText === "";

    const errorText = this.getAttribute("error") ?? "";
    errorEl.replaceChildren();
    if (errorText) {
      const prefix = document.createElement("span");
      prefix.className = "cui-visually-hidden";
      prefix.textContent = "Error: ";
      errorEl.append(prefix, errorText);
    }
    errorEl.hidden = errorText === "";
    wrapper.classList.toggle("has-error", errorText !== "");
    if (errorText) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");

    const describedBy = [hintText && hintEl.id, errorText && errorEl.id].filter(Boolean).join(" ");
    if (describedBy) control.setAttribute("aria-describedby", describedBy);
    else control.removeAttribute("aria-describedby");

    const placeholder = this.getAttribute("placeholder");
    if (placeholder !== null) control.setAttribute("placeholder", placeholder);
    // A `value` attribute set after render replaces the field's value, as a controlled value would.
    if (this.hasAttribute("value") && control.value !== this.getAttribute("value") && document.activeElement !== control) {
      control.value = this.getAttribute("value") ?? "";
    }
  }
}

if (!customElements.get("cui-text-field")) customElements.define("cui-text-field", CuiTextField);

declare global {
  interface HTMLElementTagNameMap {
    "cui-text-field": CuiTextField;
  }
}
