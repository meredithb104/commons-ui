import { afterEach, describe, expect, it, vi } from "vitest";
import { axe as rawAxe } from "vitest-axe";
import userEvent from "@testing-library/user-event";
import "../elements";
import { announce } from "../elements";
import type { CuiAlert, CuiLiveRegion, CuiTabs, CuiTextField } from "../elements";

// jsdom has no layout or paint; contrast is enforced at build time by scripts/build-tokens.mjs.
const axe = (el: Element) => rawAxe(el, { rules: { "color-contrast": { enabled: false } } });

afterEach(() => {
  document.body.innerHTML = "";
  location.hash = "";
});

/**
 * The framework-free elements get the same two kinds of test as their React twins: the behaviour a
 * keyboard or screen reader user depends on, and an axe scan with zero violations.
 */

describe("<cui-tabs>", () => {
  function mount(hash = ""): CuiTabs {
    if (hash) location.hash = hash;
    // Inside <main>, as on a page: axe's "region" rule is about the page, not the component.
    document.body.innerHTML = `<main>
      <cui-tabs label="Guide sections">
        <ul data-tabs>
          <li><a href="#rights">Your rights</a></li>
          <li><a href="#derechos" lang="es">Tus derechos</a></li>
          <li><a href="#help">Get help</a></li>
        </ul>
        <section id="rights"><h3 data-panel-heading>Your rights</h3><p>Stay calm.</p></section>
        <section id="derechos"><p>Mantén la calma.</p></section>
        <section id="help"><p><a href="#x">Call</a></p></section>
      </cui-tabs></main>`;
    return document.querySelector("cui-tabs")!;
  }

  it("upgrades a list of links and sections into APG tabs with one tab stop", () => {
    mount();
    const list = document.querySelector('[role="tablist"]')!;
    expect(list.getAttribute("aria-label")).toBe("Guide sections");
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabs.map((t) => t.textContent)).toEqual(["Your rights", "Tus derechos", "Get help"]);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual(["true", "false", "false"]);
    expect(tabs[0]!.getAttribute("aria-controls")).toBe("rights");
    expect(tabs[0]!.getAttribute("aria-label")).toBe("Your rights");
    const panels = [...document.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(panels.map((p) => p.hidden)).toEqual([false, true, true]);
    expect(panels[0]!.getAttribute("aria-labelledby")).toBe(tabs[0]!.id);
    expect(panels[0]!.tabIndex).toBe(0);
    expect(panels[0]!.querySelector("h3")).toBeNull(); // the tab names the panel now
    expect(document.querySelector("[data-tabs]")).toBeNull();
  });

  it("carries a link's lang to its tab and panel (WCAG 3.1.2)", () => {
    mount();
    const tab = document.querySelectorAll<HTMLElement>('[role="tab"]')[1]!;
    expect(tab.getAttribute("lang")).toBe("es");
    expect(document.getElementById("derechos")!.getAttribute("lang")).toBe("es");
  });

  it("moves and selects with arrows, Home, and End, wrapping at the ends, and tells the consumer", async () => {
    const host = mount();
    const seen: string[] = [];
    host.addEventListener("cui-tab-change", (e) => seen.push(e.detail.id));
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    tabs[0]!.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
    expect(document.getElementById("derechos")!.hidden).toBe(false);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(document.activeElement).toBe(tabs[2]); // wrapped
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(tabs[0]);
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(tabs[2]);
    expect(host.selectedIndex).toBe(2);
    expect(seen).toEqual(["derechos", "rights", "help", "rights", "help"]);
  });

  it("opens the panel a URL fragment names", () => {
    mount("#help");
    expect(document.getElementById("help")!.hidden).toBe(false);
    expect(document.getElementById("rights")!.hidden).toBe(true);
  });

  it("has no axe violations", async () => {
    mount();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("<cui-text-field>", () => {
  function mount(attrs: string): CuiTextField {
    document.body.innerHTML = `<main><cui-text-field ${attrs}></cui-text-field></main>`;
    return document.querySelector("cui-text-field")!;
  }

  it("associates label, hint, and error with the input in reading order", () => {
    const host = mount('label="Email" hint="We reply within a day" required');
    const input = host.input as HTMLInputElement;
    const label = document.querySelector("label")!;
    expect(label.htmlFor).toBe(input.id);
    expect(label.textContent).toContain("Email");
    expect(label.textContent).toContain("(required)");
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-describedby")).toBe(`${input.id}-hint`);
    expect(input.getAttribute("aria-invalid")).toBeNull();
    host.error = "Enter an address with an @";
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(`${input.id}-hint ${input.id}-error`);
    expect(document.getElementById(`${input.id}-error`)!.textContent).toBe("Error: Enter an address with an @");
    host.error = "";
    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBe(`${input.id}-hint`);
  });

  it("renders a textarea for multiline and passes through name, type, and value", () => {
    const host = mount('label="Notes" multiline rows="3" name="notes" value="hello"');
    expect(host.input).toBeInstanceOf(HTMLTextAreaElement);
    expect((host.input as HTMLTextAreaElement).rows).toBe(3);
    expect(host.input!.name).toBe("notes");
    expect(host.value).toBe("hello");
    const email = mount('label="Email" type="email" name="email"');
    expect((email.input as HTMLInputElement).type).toBe("email");
  });

  it("has no axe violations with and without an error", async () => {
    const host = mount('label="Email" hint="We reply within a day"');
    expect(await axe(document.body)).toHaveNoViolations();
    host.error = "Enter an address";
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe("<cui-live-region> and announce()", () => {
  it("mounts two empty regions and announces after clearing, so repeats are heard", () => {
    vi.useFakeTimers();
    document.body.innerHTML = "<cui-live-region></cui-live-region>";
    const region = document.querySelector("cui-live-region") as CuiLiveRegion;
    const polite = region.querySelector('[aria-live="polite"]')!;
    const assertive = region.querySelector('[aria-live="assertive"]')!;
    expect(polite.textContent).toBe("");
    expect(assertive.getAttribute("aria-atomic")).toBe("true");
    announce("Showing 2 of 5");
    expect(polite.textContent).toBe(""); // cleared first
    vi.advanceTimersByTime(40);
    expect(polite.textContent).toBe("Showing 2 of 5");
    announce("Showing 2 of 5");
    expect(polite.textContent).toBe("");
    vi.advanceTimersByTime(40);
    expect(polite.textContent).toBe("Showing 2 of 5");
    announce("Session ending", "assertive");
    vi.advanceTimersByTime(40);
    expect(assertive.textContent).toBe("Session ending");
    vi.useRealTimers();
  });

  it("creates the region on first use when the page has none", () => {
    vi.useFakeTimers();
    announce("Hello");
    const region = document.querySelector("cui-live-region");
    expect(region).not.toBeNull();
    vi.advanceTimersByTime(40);
    expect(region!.querySelector('[aria-live="polite"]')!.textContent).toBe("Hello");
    vi.useRealTimers();
  });
});

describe("<cui-alert>", () => {
  it("is role=alert for errors and role=status otherwise, with the tone written as text", () => {
    document.body.innerHTML = `<main>
      <cui-alert tone="error" title="Check the form">Two fields need attention.</cui-alert>
      <cui-alert tone="success">Saved.</cui-alert>
      <cui-alert>Just so you know.</cui-alert></main>`;
    const [error, success, info] = [...document.querySelectorAll<CuiAlert>("cui-alert")];
    expect(error!.querySelector("[role]")!.getAttribute("role")).toBe("alert");
    expect(error!.querySelector(".cui-alert__title")!.textContent).toBe("Error: Check the form");
    expect(error!.hasAttribute("title")).toBe(false); // no native tooltip left on the host
    expect(success!.querySelector("[role]")!.getAttribute("role")).toBe("status");
    expect(success!.querySelector(".cui-alert__title")!.textContent).toBe("Success: Success");
    expect(info!.querySelector(".cui-alert__body")!.textContent).toBe("Just so you know.");
    info!.message = "Updated.";
    expect(info!.querySelector(".cui-alert__body")!.textContent).toBe("Updated.");
  });

  it("has no axe violations", async () => {
    document.body.innerHTML = `<main><cui-alert tone="error">No.</cui-alert><cui-alert tone="success">Yes.</cui-alert></main>`;
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
