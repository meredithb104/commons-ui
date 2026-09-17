import { useEffect, useRef } from "react";
import { cx, useStableId } from "./utils";
import { Button } from "./Button";

/**
 * Modal dialog on top of the native <dialog> element.
 *
 * The native element gives us, for free and correctly across browsers:
 * - a real top-layer with everything behind it made inert (no focus trap code to get wrong)
 * - Escape to close
 * - aria-modal semantics
 *
 * What we add:
 * - initial focus goes to the first focusable element, or the dialog itself
 * - focus returns to the element that opened the dialog when it closes (WCAG 2.4.3 Focus Order)
 * - accessible name via aria-labelledby on the heading, optional description
 * - a visible close button that is also the last element in the tab order
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  closeLabel = "Close",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  closeLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const id = useStableId("dialog");
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      opener.current = document.activeElement;
      el.showModal();
      // Prefer the first focusable control inside the body; fall back to the dialog.
      const first = el.querySelector<HTMLElement>(
        '[data-autofocus], input, textarea, select, button:not([data-dialog-close]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      (first ?? el).focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Native close (Escape, or form method=dialog) -> tell the parent, restore focus.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => {
      onClose();
      const target = opener.current as HTMLElement | null;
      target?.focus?.();
    };
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={cx("cui-dialog", className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClick={(e) => {
        // Click on the backdrop (outside the panel) closes. Clicks inside do nothing.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="cui-dialog__panel">
        <h2 id={titleId} className="cui-dialog__title" tabIndex={-1}>
          {title}
        </h2>
        {description && (
          <p id={descId} className="cui-dialog__description">
            {description}
          </p>
        )}
        <div className="cui-dialog__body">{children}</div>
        <div className="cui-dialog__footer">
          <Button variant="secondary" data-dialog-close onClick={() => ref.current?.close()}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
