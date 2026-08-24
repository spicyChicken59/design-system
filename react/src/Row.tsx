import * as React from 'react';
import { cx } from './cx.js';

export interface RowProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Items pushed to the far right, after `children`. Rendered as a nested
   * `sc-row sc-right`, so several end items keep the 16px gap between them.
   */
  end?: React.ReactNode;
  /** @deprecated 2.1 — did nothing. Use `end` for right-aligned items. Removed in 3.0. */
  spread?: boolean;
}

/**
 * A horizontal run of items — chips, buttons, meta — centred on their baseline
 * with a 16px gap, wrapping when it runs out of room. Put right-aligned items
 * in `end`.
 */
export const Row = React.forwardRef<HTMLDivElement, RowProps>(function Row(
  { end, spread: _spread, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('sc-row', className)} {...rest}>
      {children}
      {end != null && end !== false && end !== true ? <div className="sc-row sc-right">{end}</div> : null}
    </div>
  );
});
Row.displayName = 'Row';
