import * as React from 'react';
import { cx } from './cx';

export interface RowProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Push everything after this point to the far right (adds `sc-right` to the last child slot). */
  spread?: boolean;
}

/**
 * A horizontal run of items — chips, buttons, meta — centred on their baseline
 * with a 16px gap, wrapping when it runs out of room.
 */
export function Row({ spread = false, className, children, ...rest }: RowProps) {
  return (
    <div className={cx('sc-row', className)} {...rest}>
      {children}
      {spread ? <span className="sc-right" /> : null}
    </div>
  );
}
