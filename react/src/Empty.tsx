import * as React from 'react';
import { cx } from './cx.js';

export interface EmptyProps extends React.ComponentPropsWithoutRef<'div'> {
  /** `div` (default) for a chart or list; `row` renders `tr.sc-empty` with one spanning cell for a table body. */
  as?: 'div' | 'row';
  /** Row form: how many columns the cell spans. */
  colSpan?: number;
}

/**
 * The empty state — nothing to show yet. One sentence, no apology, no graphic:
 * "No listings matched. Widen the radius or clear a filter."
 */
export const Empty = React.forwardRef<HTMLDivElement | HTMLTableRowElement, EmptyProps>(function Empty(
  { as = 'div', colSpan, className, children, ...rest },
  ref,
) {
  if (as === 'row') {
    const rowProps = rest as React.ComponentPropsWithoutRef<'tr'>;
    return (
      <tr ref={ref as React.Ref<HTMLTableRowElement>} className={cx('sc-empty', className)} {...rowProps}>
        <td colSpan={colSpan}>{children}</td>
      </tr>
    );
  }
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cx('sc-empty', className)} {...rest}>
      {children}
    </div>
  );
});
Empty.displayName = 'Empty';
