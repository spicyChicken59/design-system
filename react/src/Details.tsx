import * as React from 'react';
import { cx } from './cx.js';

export interface DetailsProps extends React.ComponentPropsWithoutRef<'details'> {
  /** The lowercase mono summary line. CSS draws the → / ↓ marker. */
  summary: React.ReactNode;
}

/**
 * A disclosure. Its standing job in this system is the table twin: every chart
 * gets one underneath holding the same numbers as a `Table`.
 */
export const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(function Details(
  { summary, className, children, ...rest },
  ref,
) {
  return (
    <details ref={ref} className={cx('sc-details', className)} {...rest}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
});
Details.displayName = 'Details';
