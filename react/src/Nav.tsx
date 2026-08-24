import * as React from 'react';
import { cx } from './cx.js';

export interface NavItem {
  /** Destination. */
  href: string;
  /** Link text. */
  label: React.ReactNode;
  /** Marks the page you are on — draws the spice underline. */
  current?: boolean;
}

export interface NavProps extends React.ComponentPropsWithoutRef<'nav'> {
  /** The links, in order. Keep it to five or fewer. */
  items: NavItem[];
}

/**
 * Primary navigation inside the masthead. The current page carries a spice
 * underline; everything else sits at 80% opacity until hovered. Always named:
 * `aria-label="Primary"` unless you pass another.
 */
export const Nav = React.forwardRef<HTMLElement, NavProps>(function Nav({ items, className, ...rest }, ref) {
  return (
    <nav ref={ref} className={cx('sc-nav', className)} aria-label="Primary" {...rest}>
      {items.map((item, i) => (
        <a key={i + ':' + item.href} href={item.href} aria-current={item.current ? 'page' : undefined}>
          {item.label}
        </a>
      ))}
    </nav>
  );
});
Nav.displayName = 'Nav';
