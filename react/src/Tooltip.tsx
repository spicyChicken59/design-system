import * as React from 'react';
import { cx } from './cx.js';

export interface TooltipRow {
  /** Series colour for the key mark. */
  color: string;
  /** Series name. */
  label: React.ReactNode;
  /** The value — it leads, so keep it short and formatted. */
  value: React.ReactNode;
}

export interface TooltipProps extends React.ComponentPropsWithoutRef<'div'> {
  /** The point being described — a date or category, in mono. */
  date?: React.ReactNode;
  /** One row per series at this point. */
  rows: TooltipRow[];
  /** A closing line of context under the rows. */
  meta?: React.ReactNode;
  /** Fade it in. Hidden from view and from assistive tech until this is true. */
  open?: boolean;
}

/**
 * The chart tooltip: an ink panel that stays dark in both themes, listing every
 * series at the hovered point. Position it yourself (the ref reaches the panel)
 * inside a `Chart` or any `position: relative` container — it is absolutely
 * positioned and never captures the pointer. It carries no ARIA role by default:
 * the chart's `Details` table twin is where the values are reachable. Pass
 * `role="status"` with `aria-live="polite"` if you want each point announced.
 */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { date, rows, meta, open = false, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('sc-tooltip', open && 'is-on', className)} aria-hidden={!open} {...rest}>
      {date ? <div className="sc-tooltip__date">{date}</div> : null}
      {rows.map((row, i) => (
        <div className="sc-tooltip__row" key={i}>
          <i style={{ background: row.color }} />
          <b>{row.value}</b>
          <span>{row.label}</span>
        </div>
      ))}
      {meta ? <div className="sc-tooltip__meta">{meta}</div> : null}
    </div>
  );
});
Tooltip.displayName = 'Tooltip';
