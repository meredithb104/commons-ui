import { forwardRef } from "react";
import { cx, useStableId } from "./utils";

type Shared = {
  label: string;
  /** Guidance shown under the label and read before the field. */
  hint?: string;
  /** Error text. When present, the field is aria-invalid and the error is read after the hint. */
  error?: string;
  id?: string;
  required?: boolean;
  className?: string;
};

export type TextFieldProps = Shared &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "required" | "className"> & {
    multiline?: false;
  };

export type TextAreaProps = Shared &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "required" | "className"> & {
    multiline: true;
    rows?: number;
  };

/**
 * TextField / TextArea with the whole WCAG form pattern built in:
 * - visible <label> associated by id (1.3.1, 3.3.2)
 * - hint and error joined via aria-describedby in reading order (hint, then error)
 * - aria-invalid when there is an error (3.3.1)
 * - required communicated both visually and via `required`; we never rely on the asterisk alone
 * - the error element keeps a stable id so <FormErrorSummary> can link to the field
 */
export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps | TextAreaProps>(
  function TextField(props, ref) {
    const { label, hint, error, id: providedId, required, className, ...rest } = props;
    const id = useStableId("field", providedId);
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

    const shared = {
      id,
      "aria-describedby": describedBy,
      "aria-invalid": error ? true : undefined,
      required,
      className: "cui-field__input",
    };

    return (
      <div className={cx("cui-field", error && "has-error", className)}>
        <label className="cui-field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="cui-field__required">
              {" "}
              <span aria-hidden="true">*</span>
              <span className="cui-visually-hidden">(required)</span>
            </span>
          )}
        </label>
        {hint && (
          <p className="cui-field__hint" id={hintId}>
            {hint}
          </p>
        )}
        {error && (
          <p className="cui-field__error" id={errorId}>
            <span className="cui-visually-hidden">Error: </span>
            {error}
          </p>
        )}
        {"multiline" in props && props.multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            {...shared}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="text"
            {...shared}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
    );
  },
);
