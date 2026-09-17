import { useId } from "react";

/** Join class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Stable id, or the caller's id if they passed one. */
export function useStableId(prefix: string, provided?: string): string {
  const generated = useId();
  return provided ?? `${prefix}-${generated}`;
}

/** Visually hidden but available to assistive technology. */
export function VisuallyHidden({
  as: Tag = "span",
  children,
  ...rest
}: {
  as?: "span" | "div" | "p" | "label";
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className="cui-visually-hidden" {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Skip link: the first focusable thing on the page. WCAG 2.4.1 Bypass Blocks.
 * Becomes visible on focus. Target must exist and be focusable (tabIndex={-1} is fine).
 */
export function SkipLink({ href = "#main", children = "Skip to main content" }: { href?: string; children?: React.ReactNode }) {
  return (
    <a className="cui-skip-link" href={href}>
      {children}
    </a>
  );
}
