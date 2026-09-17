import { cx, useStableId } from "./utils";

/**
 * Switch: an on/off control that takes effect immediately (unlike a checkbox,
 * which is usually part of a form you submit later).
 * - role="switch" with aria-checked on a real <button>
 * - visible label associated by id; label click toggles
 * - Space and Enter toggle (native button behaviour)
 * - state is also shown as text ("On"/"Off") so it never relies on color alone (WCAG 1.4.1)
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  id: providedId,
  onText = "On",
  offText = "Off",
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  id?: string;
  onText?: string;
  offText?: string;
  className?: string;
}) {
  const id = useStableId("switch", providedId);
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;

  return (
    <div className={cx("cui-switch", checked && "is-on", className)}>
      <div className="cui-switch__text">
        <span id={labelId} className="cui-switch__label">
          {label}
        </span>
        {description && (
          <span id={descId} className="cui-switch__description">
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        className="cui-switch__control"
        onClick={() => onChange(!checked)}
      >
        <span className="cui-switch__track" aria-hidden="true">
          <span className="cui-switch__thumb" />
        </span>
        <span className="cui-switch__state">{checked ? onText : offText}</span>
      </button>
    </div>
  );
}
