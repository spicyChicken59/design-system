import * as React from 'react';
import { cx } from './cx';

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
 * underline; everything else sits at 80% opacity until hovered.
 */
export function Nav({ items, className, ...rest }: NavProps) {
  return (
    <nav className={cx('sc-nav', className)} aria-label="Primary" {...rest}>
      {items.map((item) => (
        <a key={item.href} href={item.href} aria-current={item.current ? 'page' : undefined}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
