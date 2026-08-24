import * as React from 'react';
import { cx } from './cx.js';

export interface SkipLinkProps extends React.ComponentPropsWithoutRef<'a'> {}

/**
 * The bypass link keyboard users hit first: off-screen until focused, then a
 * small surface-coloured pill at the top-left. Place it before the masthead and
 * point `href` at the `<main>` id. `Masthead skipTo` renders one for you.
 */
export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { className, href = '#main', children = 'Skip to content', ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx('sc-skip', className)} href={href} {...rest}>
      {children}
    </a>
  );
});
SkipLink.displayName = 'SkipLink';
