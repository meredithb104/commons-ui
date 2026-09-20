import { forwardRef } from "react";
import { cx } from "./utils";

export type MenuButtonProps = {
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
 * - 44px minimum target (WCAG 2.5.8 Target Size), well past the 24px minimum, and the shared focus ring.
 * - Border and text switch to the primary color while expanded, so state is never color-only (1.4.1) —
 *   aria-expanded already carries it for assistive tech, and text/icon shape doesn't change.
 */
export const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(function MenuButton(
  { open, onOpenChange, label, controls, id, className },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      id={id}
      className={cx("cui-menu-button", className)}
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
      {label}
    </button>
  );
});
