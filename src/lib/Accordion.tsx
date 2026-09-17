import { createContext, useContext, useRef, useState } from "react";
import { cx, useStableId } from "./utils";

/**
 * Accordion, per the WAI-ARIA Authoring Practices pattern.
 * - Each header is a real <button> inside a heading element, so it shows up in
 *   the headings list *and* is operable.
 * - aria-expanded / aria-controls on the button; region labelled by its button.
 * - Keyboard: Enter/Space toggle, Up/Down move between headers, Home/End jump.
 * - `allowMultiple` lets several panels open at once (default true: users
 *   reading "know your rights" content usually want to compare sections).
 */

type Ctx = {
  openIds: Set<string>;
  toggle: (id: string) => void;
  headingLevel: 2 | 3 | 4;
  register: (el: HTMLButtonElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
};

const AccordionContext = createContext<Ctx | null>(null);

export function Accordion({
  children,
  allowMultiple = true,
  defaultOpen = [],
  headingLevel = 3,
  className,
}: {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpen?: string[];
  headingLevel?: 2 | 3 | 4;
  className?: string;
}) {
  const [openIds, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));
  const buttons = useRef<HTMLButtonElement[]>([]);

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const register = (el: HTMLButtonElement | null) => {
    if (el && !buttons.current.includes(el)) buttons.current.push(el);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const list = buttons.current.filter((b) => b.isConnected);
    const i = list.indexOf(e.currentTarget);
    if (i === -1) return;
    const go = (n: number) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    switch (e.key) {
      case "ArrowDown":
        go(i + 1);
        break;
      case "ArrowUp":
        go(i - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(list.length - 1);
        break;
    }
  };

  return (
    <AccordionContext.Provider value={{ openIds, toggle, headingLevel, register, onKeyDown }}>
      <div className={cx("cui-accordion", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id: providedId,
  title,
  children,
}: {
  id?: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be inside <Accordion>.");
  const id = useStableId("acc", providedId);
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;
  const open = ctx.openIds.has(id);
  const Heading = `h${ctx.headingLevel}` as const;

  return (
    <div className={cx("cui-accordion__item", open && "is-open")}>
      <Heading className="cui-accordion__heading">
        <button
          ref={ctx.register}
          type="button"
          id={buttonId}
          className="cui-accordion__trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => ctx.toggle(id)}
          onKeyDown={ctx.onKeyDown}
        >
          <span className="cui-accordion__title">{title}</span>
          <span className="cui-accordion__icon" aria-hidden="true">
            {open ? "−" : "+"}
          </span>
        </button>
      </Heading>
      <div id={panelId} role="region" aria-labelledby={buttonId} className="cui-accordion__panel" hidden={!open}>
        <div className="cui-accordion__content">{children}</div>
      </div>
    </div>
  );
}
