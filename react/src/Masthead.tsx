import * as React from 'react';
import { cx } from './cx';

export interface MastheadProps extends React.ComponentPropsWithoutRef<'header'> {
  /** The project lockup on the left — normally a `Brand`. */
  brand: React.ReactNode;
  /** What sits on the right: a `Nav`, then a divider, then a `ThemeToggle`. */
  right?: React.ReactNode;
}

/**
 * The page's top bar. The project leads on the left and the brand endorses on
 * the right. Stays ink-dark in both themes — that is what keeps a light page
 * recognisably the same product as its dark sibling.
 */
export function Masthead({ brand, right, className, ...rest }: MastheadProps) {
  return (
    <header className={cx('sc-masthead', className)} {...rest}>
      {brand}
      {right ? <div className="sc-masthead__right">{right}</div> : null}
    </header>
  );
}
