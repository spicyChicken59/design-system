import * as React from 'react';
import { cx } from './cx.js';

export interface EyebrowProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Colour role. `brand` cobalt (default), `accent` spice, `muted` for secondary rows. */
  tone?: 'brand' | 'accent' | 'muted';
}

/**
 * The system's signature tell: a lowercase mono label opened by a dimmed `//`.
 * The `//` is drawn by CSS (and hidden from assistive tech) — pass only the
 * words. Sits directly above a heading on every title block, section opener
 * and callout. Never ALL-CAPS.
 */
export const Eyebrow = React.forwardRef<HTMLDivElement, EyebrowProps>(function Eyebrow(
  { tone = 'brand', className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('sc-eyebrow', tone === 'accent' && 'sc-eyebrow--accent', tone === 'muted' && 'sc-eyebrow--muted', className)}
      {...rest}
    />
  );
});
Eyebrow.displayName = 'Eyebrow';
