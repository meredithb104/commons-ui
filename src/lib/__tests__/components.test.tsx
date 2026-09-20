import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe as rawAxe } from "vitest-axe";
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  Alert,
  Button,
  Dialog,
  FormErrorSummary,
  LiveRegionProvider,
  MenuButton,
  ProgressMeter,
  Switch,
  Tabs,
  TextField,
  useAnnouncer,
} from "..";

// jsdom has no layout or paint, so axe cannot measure color contrast here.
// Contrast is enforced at build time by scripts/build-tokens.mjs instead.
const axe = (el: Element) => rawAxe(el, { rules: { "color-contrast": { enabled: false } } });

/**
 * Every component gets two kinds of test:
 *  1. behaviour a keyboard or screen reader user depends on (focus, ARIA state, key handling)
 *  2. an axe-core scan with zero violations
 * axe catches the static mistakes (missing names, bad roles). The behaviour
 * tests catch the ones axe cannot see, like focus going nowhere on submit.
 */

describe("Button", () => {
  it("stays focusable while loading and blocks clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Button>Add my name</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("TextField", () => {
  it("associates label, hint and error, and marks invalid", () => {
    render(<TextField id="f" label="Name" hint="First name is fine" error="Enter a name" required />);
    const input = screen.getByRole("textbox", { name: /name/i });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/First name is fine Error:\s*Enter a name/);
    expect(input).toBeRequired();
  });

  it("renders a textarea when multiline", () => {
    render(<TextField multiline label="Need" rows={3} />);
    expect(screen.getByRole("textbox", { name: "Need" }).tagName).toBe("TEXTAREA");
  });

  it("has no axe violations with and without an error", async () => {
    const { container, rerender } = render(<TextField label="Email" hint="We will not share it" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<TextField label="Email" error="Enter an email" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FormErrorSummary", () => {
  it("takes focus when errors appear and links focus the field", async () => {
    function Harness() {
      const [errors, setErrors] = useState<{ fieldId: string; message: string }[]>([]);
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrors([{ fieldId: "name", message: "Enter your name" }]);
          }}
        >
          <FormErrorSummary errors={errors} />
          <TextField id="name" label="Name" error={errors[0]?.message} />
          <Button type="submit">Send</Button>
        </form>
      );
    }
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    await userEvent.click(within(summary).getByRole("link", { name: "Enter your name" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  });
});

describe("Accordion", () => {
  const ui = (
    <Accordion defaultOpen={["a"]}>
      <AccordionItem id="a" title="First">
        <p>One</p>
      </AccordionItem>
      <AccordionItem id="b" title="Second">
        <p>Two</p>
      </AccordionItem>
      <AccordionItem id="c" title="Third">
        <p>Three</p>
      </AccordionItem>
    </Accordion>
  );

  it("exposes expanded state and toggles with Enter", async () => {
    render(ui);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");
    second.focus();
    await userEvent.keyboard("{Enter}");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Second" })).toBeVisible();
  });

  it("moves focus with arrow keys, Home and End, and wraps", async () => {
    render(ui);
    const [first, second, third] = ["First", "Second", "Third"].map((n) => screen.getByRole("button", { name: n }));
    first.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(third).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    expect(third).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(first).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(ui);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Tabs", () => {
  const tabs = [
    { id: "en", lang: "en", label: "English", content: <p>Hello</p> },
    { id: "es", lang: "es", label: "Español", content: <p>Hola</p> },
    { id: "pt", lang: "pt", label: "Português", content: <p>Olá</p> },
  ];

  it("uses roving tabindex and arrow keys, and sets lang on tab and panel", async () => {
    render(<Tabs label="Language" tabs={tabs} />);
    const [en, es, pt] = screen.getAllByRole("tab");
    expect(en).toHaveAttribute("aria-selected", "true");
    expect(en).toHaveAttribute("tabindex", "0");
    expect(es).toHaveAttribute("tabindex", "-1");
    en.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(es).toHaveFocus();
    expect(es).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("lang", "es");
    await userEvent.keyboard("{End}");
    expect(pt).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(en).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Tabs label="Language" tabs={tabs} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Dialog", () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Report" description="Two questions.">
          <TextField id="where" label="Where?" />
        </Dialog>
      </>
    );
  }

  it("moves focus into the dialog on open and back to the opener on close", async () => {
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open" });
    await userEvent.click(opener);
    expect(screen.getByRole("textbox", { name: "Where?" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(opener).toHaveFocus();
  });

  it("is labelled by its title and described by its description", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAccessibleName("Report");
    expect(dialog).toHaveAccessibleDescription("Two questions.");
  });
});

describe("Switch", () => {
  it("is a switch with visible state text and toggles with Space", async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onChange={setOn} label="Plain language" />;
    }
    render(<Harness />);
    const sw = screen.getByRole("switch", { name: "Plain language" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    expect(sw).toHaveTextContent("Off");
    sw.focus();
    await userEvent.keyboard(" ");
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toHaveTextContent("On");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Switch checked onChange={() => {}} label="Plain language" description="Shorter sentences." />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("MenuButton", () => {
  it("names itself from `label`, exposes expanded state, and toggles with the keyboard", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return <MenuButton open={open} onOpenChange={setOpen} label="Main menu" controls="site-nav" />;
    }
    render(<Harness />);
    const btn = screen.getByRole("button", { name: "Main menu" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls", "site-nav");
    btn.focus();
    await userEvent.keyboard(" ");
    expect(btn).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Enter}");
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("has no axe violations open or closed", async () => {
    const { container, rerender } = render(<MenuButton open={false} onOpenChange={() => {}} label="Main menu" />);
    expect(await axe(container)).toHaveNoViolations();
    rerender(<MenuButton open onOpenChange={() => {}} label="Main menu" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ProgressMeter", () => {
  it("exposes value, max and human value text", () => {
    render(<ProgressMeter label="Signatures" value={1387} max={2000} unit="signatures" />);
    const bar = screen.getByRole("progressbar", { name: "Signatures" });
    expect(bar).toHaveAttribute("aria-valuenow", "1387");
    expect(bar).toHaveAttribute("aria-valuemax", "2000");
    expect(bar).toHaveAttribute("aria-valuetext", "1,387 of 2,000 signatures (69%)");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProgressMeter label="Signatures" value={10} max={100} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Alert", () => {
  it("uses alert for errors and status otherwise, and names the tone in text", () => {
    render(
      <>
        <Alert tone="error">Something broke</Alert>
        <Alert tone="success">Saved</Alert>
      </>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Error:");
    expect(screen.getByRole("status")).toHaveTextContent("Success:");
  });
});

describe("LiveRegionProvider", () => {
  it("mounts empty live regions and fills them on announce", async () => {
    function Harness() {
      const { announce } = useAnnouncer();
      return <Button onClick={() => announce("Theme changed")}>Go</Button>;
    }
    render(
      <LiveRegionProvider>
        <Harness />
      </LiveRegionProvider>,
    );
    const polite = document.querySelector('[aria-live="polite"]')!;
    expect(polite).toBeEmptyDOMElement();
    await userEvent.click(screen.getByRole("button"));
    await new Promise((r) => setTimeout(r, 60));
    expect(polite).toHaveTextContent("Theme changed");
  });
});
