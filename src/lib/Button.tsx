import { forwardRef } from "react";
import { cx } from "./utils";

type Variant = "primary" | "secondary" | "quiet" | "danger";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** Announces a busy state and blocks re-submission without disabling the control (disabled buttons drop out of the tab order and go silent). */
  loading?: boolean;
  /** Text shown while loading. Defaults to the button's children plus an ellipsis. */
  loadingLabel?: string;
};

/**
 * Button. Always a real <button>, never a div with onClick.
 * - `loading` sets aria-busy and aria-disabled instead of `disabled` so keyboard and screen reader users keep focus and get told why nothing is happening.
 * - Minimum 44px target from tokens.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, loadingLabel, className, children, type = "button", onClick, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("cui-button", `cui-button--${variant}`, loading && "is-loading", className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || rest.disabled || undefined}
      onClick={(e) => {
        if (loading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {loading ? (loadingLabel ?? <>{children}&hellip;</>) : children}
    </button>
  );
});
