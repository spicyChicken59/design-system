import * as React from 'react';
import { cx } from './cx.js';
import { SkipLink } from './SkipLink.js';

export interface MastheadProps extends React.ComponentPropsWithoutRef<'header'> {
  /** The project lockup on the left — normally a `Brand`. */
  brand: React.ReactNode;
  /** What sits on the right: a `Nav`, then a `Sep`, then a `ThemeToggle`. */
  right?: React.ReactNode;
  /**
   * Render a skip link before the masthead pointing at this target, e.g. `"#main"`.
   * Give the page's `<main>` the matching id. Off unless set.
   */
  skipTo?: string;
}

/**
 * The page's top bar. The project leads on the left and the brand endorses on
 * the right. Stays ink-dark in both themes — that is what keeps a light page
 * recognisably the same product as its dark sibling.
 */
export const Masthead = React.forwardRef<HTMLElement, MastheadProps>(function Masthead(
  { brand, right, skipTo, className, ...rest },
  ref,
) {
  const header = (
    <header ref={ref} className={cx('sc-masthead', className)} {...rest}>
      {brand}
      {right ? <div className="sc-masthead__right">{right}</div> : null}
    </header>
  );
  if (!skipTo) return header;
  return (
    <>
      <SkipLink href={skipTo} />
      {header}
    </>
  );
});
Masthead.displayName = 'Masthead';
