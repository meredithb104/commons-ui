import { cx } from "./utils";

type Tone = "info" | "success" | "error";

/**
 * Inline message.
 * - `tone="error"` renders role="alert" (assertive: interrupts) because errors block the user.
 * - everything else renders role="status" (polite: waits) so success and info do not interrupt.
 * - the tone is written as text ("Error:", "Success:") so it does not rely on color or an icon alone.
 */
export function Alert({ tone = "info", title, children, className }: { tone?: Tone; title?: string; children: React.ReactNode; className?: string }) {
  const prefix = tone === "error" ? "Error" : tone === "success" ? "Success" : "Note";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("cui-alert", `cui-alert--${tone}`, className)}>
      <p className="cui-alert__title">
        <span className="cui-visually-hidden">{prefix}: </span>
        {title ?? prefix}
      </p>
      <div className="cui-alert__body">{children}</div>
    </div>
  );
}
