import * as React from 'react';
import { cx } from './cx.js';

export interface TocItem {
  /** The heading's anchor, e.g. `#method`. */
  href: string;
  /** The heading text. */
  label: React.ReactNode;
}

export interface TocProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> {
  /** The page's sections, in order. */
  items: TocItem[];
}

/**
 * The on-page contents line under a document's title: a wrapping mono row of
 * anchor links. Named "On this page" so it never collides with the primary nav.
 */
export const Toc = React.forwardRef<HTMLElement, TocProps>(function Toc({ items, className, ...rest }, ref) {
  return (
    <nav ref={ref} className={cx('sc-toc', className)} aria-label="On this page" {...rest}>
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
});
Toc.displayName = 'Toc';
