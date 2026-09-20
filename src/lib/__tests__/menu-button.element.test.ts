import { afterEach, describe, expect, it, vi } from "vitest";
import { axe as rawAxe } from "vitest-axe";
import userEvent from "@testing-library/user-event";
import "../menu-button.element";
import type { CuiMenuButton } from "../menu-button.element";

// jsdom has no layout or paint; contrast is enforced at build time by scripts/build-tokens.mjs.
const axe = (el: Element) => rawAxe(el, { rules: { "color-contrast": { enabled: false } } });

function mount(attrs = 'label="Main menu" controls="panel"'): { host: CuiMenuButton; button: HTMLButtonElement; panel: HTMLElement } {
  document.body.innerHTML = `
    <cui-menu-button ${attrs}></cui-menu-button>
    <nav id="panel" hidden><a href="#a">Link</a></nav>
    <p><button type="button" id="elsewhere">Elsewhere</button></p>`;
  const host = document.querySelector("cui-menu-button")!;
  return { host, button: host.querySelector("button")!, panel: document.getElementById("panel")! };
}

afterEach(() => {
  document.body.innerHTML = "";
});

/**
 * The same tests as MenuButton.tsx gets, against the framework-free element: a keyboard or screen
 * reader user should not be able to tell which one a page used.
 */
describe("<cui-menu-button>", () => {
  it("renders a real button named by its visible label, with aria-expanded and aria-controls", () => {
    const { button } = mount();
    expect(button.type).toBe("button");
    expect(button.textContent?.trim()).toBe("Main menu");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("panel");
    expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("toggles with Space and Enter, reflects `open`, and tells the consumer", async () => {
    const { host, button } = mount();
    const seen: boolean[] = [];
    host.addEventListener("cui-open-change", (e) => seen.push(e.detail.open));
    button.focus();
    await userEvent.keyboard(" ");
    expect(host.open).toBe(true);
    expect(host.hasAttribute("open")).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    await userEvent.keyboard("{Enter}");
    expect(host.open).toBe(false);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(seen).toEqual([true, false]);
  });

  it("follows the `open` property and attribute set by the consumer, without firing its own event", () => {
    const { host, button } = mount();
    const onChange = vi.fn();
    host.addEventListener("cui-open-change", onChange);
    host.open = true;
    expect(button.getAttribute("aria-expanded")).toBe("true");
    host.removeAttribute("open");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes on Escape from anywhere and returns focus to the button", async () => {
    const { host, button } = mount();
    host.open = true;
    document.getElementById("elsewhere")!.focus();
    await userEvent.keyboard("{Escape}");
    expect(host.open).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it("closes on a pointer down outside the button and its panel, and not on one inside the panel", () => {
    const { host, panel } = mount();
    host.open = true;
    panel.hidden = false;
    panel.querySelector("a")!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(host.open).toBe(true);
    document.getElementById("elsewhere")!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(host.open).toBe(false);
  });

  it("does not keep document listeners once closed or removed", async () => {
    const { host, button } = mount();
    host.open = true;
    host.open = false;
    document.getElementById("elsewhere")!.focus();
    await userEvent.keyboard("{Escape}");
    expect(document.activeElement).not.toBe(button); // nothing listened
    host.open = true;
    host.remove();
    document.getElementById("elsewhere")!.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(host.open).toBe(true); // detached: no listener changed it
  });

  it("applies the quiet variant as a class and keeps the label's bold width reserved", () => {
    const { button } = mount('label="More information" controls="panel" variant="quiet"');
    expect(button.classList.contains("cui-menu-button--quiet")).toBe(true);
    expect(button.querySelector(".cui-menu-button__label")?.getAttribute("data-label")).toBe("More information");
  });

  it("has no axe violations open or closed", async () => {
    const { host } = mount();
    expect(await axe(document.body)).toHaveNoViolations();
    host.open = true;
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
