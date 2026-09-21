import { useEffect, useRef } from "react";
import { cx } from "./utils";

type Tone = "info" | "success" | "error";

/**
 * Inline message.
 * - `tone="error"` renders role="alert" (assertive: interrupts) because errors block the user.
 * - everything else renders role="status" (polite: waits) so success and info do not interrupt.
 * - the tone is written as text ("Error:", "Success:") so it does not rely on color or an icon alone.
 * - `autoFocus` takes focus when this Alert mounts — for the common case where it *replaces* the
 *   control that triggered it (a submit button swapped out for a success message, say): the button
 *   unmounting drops focus to the document with nothing to say where it went. Without it, focus
 *   isn't touched, since most alerts (like this one's own default) are static and shouldn't steal it.
 */
export function Alert({
  tone = "info",
  title,
  children,
  autoFocus,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: React.ReactNode;
  autoFocus?: boolean;
  className?: string;
}) {
  const prefix = tone === "error" ? "Error" : tone === "success" ? "Success" : "Note";
  const ref = useRef<HTMLDivElement>(null);

  // Only on mount: fires once, when the alert first appears in place of whatever had focus.
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div
      ref={ref}
      tabIndex={autoFocus ? -1 : undefined}
      role={tone === "error" ? "alert" : "status"}
      className={cx("cui-alert", `cui-alert--${tone}`, className)}
    >
      <p className="cui-alert__title">
        <span className="cui-visually-hidden">{prefix}: </span>
        {title ?? prefix}
      </p>
      <div className="cui-alert__body">{children}</div>
    </div>
  );
}
