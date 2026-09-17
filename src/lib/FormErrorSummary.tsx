import { useEffect, useRef } from "react";

export type FormError = {
  /** id of the invalid field, so the summary can link to it. */
  fieldId: string;
  message: string;
};

/**
 * Error summary, the GOV.UK pattern. On submit with errors:
 * 1. render this above the form,
 * 2. move focus to it so screen reader and keyboard users land on the problem,
 * 3. each error is a link that focuses the field it describes.
 *
 * Covers WCAG 3.3.1 Error Identification and 3.3.3 Error Suggestion, and the
 * common failure where errors appear visually but focus stays on the submit button.
 */
export function FormErrorSummary({ errors, title = "There is a problem" }: { errors: FormError[]; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0) {
      ref.current?.focus();
    }
  }, [errors]);

  if (errors.length === 0) return null;

  return (
    <div className="cui-error-summary" role="alert" tabIndex={-1} ref={ref} aria-labelledby="cui-error-summary-title">
      <h2 className="cui-error-summary__title" id="cui-error-summary-title">
        {title}
      </h2>
      <ul className="cui-error-summary__list">
        {errors.map((e) => (
          <li key={e.fieldId}>
            <a
              href={`#${e.fieldId}`}
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById(e.fieldId)?.focus();
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
