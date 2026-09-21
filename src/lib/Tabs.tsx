import { useRef, useState } from "react";
import { cx, useStableId } from "./utils";

export type Tab = {
  id: string;
  label: React.ReactNode;
  /** BCP-47 language tag for the panel content, e.g. "es". Sets `lang` on the tab and panel so screen readers switch voices. WCAG 3.1.2. */
  lang?: string;
  content: React.ReactNode;
};

/**
 * Tabs, per the WAI-ARIA Authoring Practices pattern with automatic activation.
 * - role=tablist / tab / tabpanel, aria-selected, aria-controls, aria-labelledby
 * - Each tab also gets an explicit aria-label mirroring its (string) visible text. Chromium's own
 *   accessibility tree already computes the name correctly from content alone, but JAWS's element-list
 *   dialogs (e.g. its "list of buttons") can come back blank for a role-overridden <button> whose name
 *   is content-only — reported live. aria-label gives it an attribute to read instead of relying on that.
 * - Roving tabindex: only the active tab is in the Tab order; arrows move between tabs
 * - Left/Right (or Up/Down when `orientation="vertical"`), Home, End
 * - Each panel is focusable (tabIndex=0) so keyboard users can reach its content
 *   even when it has no focusable children.
 */
export function Tabs({
  tabs,
  label,
  defaultTab,
  orientation = "horizontal",
  className,
}: {
  tabs: Tab[];
  /** Accessible name for the tablist. */
  label: string;
  defaultTab?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const baseId = useStableId("tabs");
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (from: number, delta: number) => {
    const next = tabs[(from + delta + tabs.length) % tabs.length];
    setActive(next.id);
    refs.current[next.id]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const prev = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    if (e.key === nextKey) {
      e.preventDefault();
      move(i, 1);
    } else if (e.key === prev) {
      e.preventDefault();
      move(i, -1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(i, -i);
    } else if (e.key === "End") {
      e.preventDefault();
      move(i, tabs.length - 1 - i);
    }
  };

  return (
    <div className={cx("cui-tabs", `cui-tabs--${orientation}`, className)}>
      <div role="tablist" aria-label={label} aria-orientation={orientation} className="cui-tabs__list">
        {tabs.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${t.id}`}
              aria-label={typeof t.label === "string" ? t.label : undefined}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              lang={t.lang}
              className={cx("cui-tabs__tab", selected && "is-selected")}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${baseId}-panel-${t.id}`}
          aria-labelledby={`${baseId}-tab-${t.id}`}
          tabIndex={0}
          lang={t.lang}
          hidden={t.id !== active}
          className="cui-tabs__panel"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
