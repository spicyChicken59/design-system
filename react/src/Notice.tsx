import * as React from 'react';
import { cx } from './cx.js';

export interface NoticeProps extends React.ComponentPropsWithoutRef<'div'> {
  /** The eyebrow above the message — renders in the danger colour. */
  label?: React.ReactNode;
  /**
   * Set when the notice appears after load in response to something (a failed
   * fetch, a rejected save): it then carries `role="alert"` and is announced.
   * A notice that is simply on the page at load stays a plain block.
   */
  live?: boolean;
}

/**
 * The stop-and-read block: what failed, and what to do about it.
 * Heavier than a warning `Callout` — reserve it for a page that cannot proceed.
 */
export const Notice = React.forwardRef<HTMLDivElement, NoticeProps>(function Notice(
  { label, live = false, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('sc-notice', className)} role={live ? 'alert' : undefined} {...rest}>
      {label ? <div className="sc-eyebrow">{label}</div> : null}
      {children}
    </div>
  );
});
Notice.displayName = 'Notice';
