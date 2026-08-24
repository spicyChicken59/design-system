import * as React from 'react';
import { cx } from './cx.js';

export interface QuietLinkProps extends React.ComponentPropsWithoutRef<'a'> {}

/**
 * The quiet link for dense places — table cells, media rows, a footer of
 * links: muted text with a hairline underline that turns spice on hover.
 * Spice links are for prose and the one action. Adds `rel="noopener"` to
 * `target="_blank"`.
 */
export const QuietLink = React.forwardRef<HTMLAnchorElement, QuietLinkProps>(function QuietLink(
  { className, target, rel, ...rest },
  ref,
) {
  const safeRel = target === '_blank' && !rel ? 'noopener' : rel;
  return <a ref={ref} className={cx('sc-link--quiet', className)} target={target} rel={safeRel} {...rest} />;
});
QuietLink.displayName = 'QuietLink';
