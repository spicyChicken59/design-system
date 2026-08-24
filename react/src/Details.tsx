import * as React from 'react';
import { cx } from './cx';

export interface DetailsProps extends React.ComponentPropsWithoutRef<'details'> {
  /** The lowercase mono summary line. CSS draws the → / ↓ marker. */
  summary: React.ReactNode;
}

/**
 * A disclosure. Its standing job in this system is the table twin: every chart
 * gets one underneath holding the same numbers as a `Table`.
 */
export function Details({ summary, className, children, ...rest }: DetailsProps) {
  return (
    <details className={cx('sc-details', className)} {...rest}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
