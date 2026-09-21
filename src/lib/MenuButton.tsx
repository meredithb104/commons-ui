import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cx } from "./utils";

export type MenuButtonProps = {
  /** "quiet": no box, for a button that sits in a row of links; state is a tint plus bold text. */
  variant?: "default" | "quiet";
  /** Whether the menu it controls is open. */
  open: boolean;
  onOpenChange: (next: boolean) => void;
  /**
   * Visible text ("Menu", "More information", ...). This is the button's
   * accessible name (name from content) — there's no separate aria-label,
   * so the name a screen reader announces is always the name a sighted
   * user reads.
   */
  label: string;
  /** id of the menu/nav this button opens, exposed as aria-controls. */
  controls?: string;
  id?: string;
  className?: string;
};

/**
 * MenuButton ("hamburger"): a disclosure toggle for a navigation menu, per
 * the WAI-ARIA button pattern.
 * - Real <button type="button">, so it's focusable and works with Space/Enter with no extra key handling.
 * - The hamburger icon is aria-hidden; `label` is rendered as real text, so the name is never icon-only.
 * - aria-expanded reflects state; aria-controls (when given) points screen readers at the menu it opens.
 * - aria-haspopup="menu" gives it the Name/Role/Value a screen reader needs to say what it is: JAWS
 *   announces "menu button" plus "collapsed"/"expanded" from aria-expanded, not a plain, unlabeled "button".
 * - 44px minimum target (WCAG 2.5.8 Target Size), well past the 24px minimum, and the shared focus ring.
 * - Expanded state is never color-only (1.4.1): border/text switch to primary color AND the text goes
 *   bold, matching how Tabs marks its selected tab. aria-expanded carries the state for assistive tech.
 *   The label reserves its bold width, so the change of weight moves nothing beside the button.
 * - The same component exists without React as <cui-menu-button> (menu-button.element.ts), sharing
 *   this stylesheet, for pages that ship no framework.
 * - While open, Escape closes and returns focus here; a pointerdown outside both this button and the
 *   element named by `controls` closes too, without stealing focus from wherever the click landed.
 * - Opening moves focus to the first focusable element inside `controls` (APG's Menu Button pattern,
 *   not Disclosure). This isn't optional polish: JAWS in Edge/Chrome doesn't reliably notice a region
 *   that goes from `hidden` to visible until real DOM focus lands inside it — Tab alone can leave its
 *   virtual buffer stale, so the panel is visible but unreachable. Moving focus in forces the resync.
 */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton(
  { open, onOpenChange, label, controls, id, className, variant = "default" },
  forwardedRef,
) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(forwardedRef, () => buttonRef.current as HTMLButtonElement, []);

  useEffect(() => {
    if (!open) return;

    const isInside = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false;
      if (buttonRef.current?.contains(target)) return true;
      const panel = controls ? document.getElementById(controls) : null;
      return panel?.contains(target) ?? false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      onOpenChange(false);
      buttonRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!isInside(event.target)) onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onOpenChange, controls]);

  useEffect(() => {
    if (!open || !controls) return;
    const panel = document.getElementById(controls);
    // Not our job to reveal the panel — if the consumer hasn't (yet), there's nothing focusable there.
    if (!panel || panel.hidden) return;
    const first = panel.querySelector<HTMLElement>(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
  }, [open, controls]);

  return (
    <button
      ref={buttonRef}
      type="button"
      id={id}
      className={cx("cui-menu-button", variant === "quiet" && "cui-menu-button--quiet", className)}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={controls}
      onClick={() => onOpenChange(!open)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M3 5h14M3 10h14M3 15h14" />
      </svg>
      <span className="cui-menu-button__label" data-label={label}>
        {label}
      </span>
    </button>
  );
});
