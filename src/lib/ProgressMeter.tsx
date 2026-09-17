import { cx, useStableId } from "./utils";

/**
 * Progress toward a goal (signatures, donations, volunteers).
 * - role="progressbar" with aria-valuenow/min/max and a human aria-valuetext
 *   ("1,240 of 2,000 signatures") so the number is not read as a bare percent
 * - the same text is rendered visibly; the bar is decorative
 * - fill uses tokens whose contrast against the track is enforced at build time
 * - announcing milestones is left to the caller via useAnnouncer, so the
 *   component never spams a live region on every increment
 */
export function ProgressMeter({
  value,
  max,
  label,
  unit = "",
  id: providedId,
  className,
}: {
  value: number;
  max: number;
  /** Accessible name, e.g. "Petition signatures". */
  label: string;
  /** Plural noun for the value text, e.g. "signatures". */
  unit?: string;
  id?: string;
  className?: string;
}) {
  const id = useStableId("meter", providedId);
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  const valueText = `${value.toLocaleString()} of ${max.toLocaleString()} ${unit}`.trim() + ` (${pct}%)`;

  return (
    <div className={cx("cui-meter", className)}>
      <div className="cui-meter__header">
        <span id={`${id}-label`} className="cui-meter__label">
          {label}
        </span>
        <span className="cui-meter__value">{valueText}</span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={`${id}-label`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        className="cui-meter__track"
      >
        <div className="cui-meter__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
