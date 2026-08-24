import * as React from 'react';
import { cx } from './cx';

export interface NoticeProps extends React.ComponentPropsWithoutRef<'div'> {
  /** The eyebrow above the message — renders in the danger colour. */
  label?: React.ReactNode;
}

/**
 * The stop-and-read block: what failed, and what to do about it.
 * Heavier than a warning `Callout` — reserve it for a page that cannot proceed.
 */
export function Notice({ label, className, children, ...rest }: NoticeProps) {
  return (
    <div className={cx('sc-notice', className)} role="alert" {...rest}>
      {label ? <div className="sc-eyebrow">{label}</div> : null}
      {children}
    </div>
  );
}
