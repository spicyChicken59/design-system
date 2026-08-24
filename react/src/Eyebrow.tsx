import * as React from 'react';
import { cx } from './cx';

export interface EyebrowProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Colour role. `brand` cobalt (default), `accent` spice, `muted` for secondary rows. */
  tone?: 'brand' | 'accent' | 'muted';
}

/**
 * The system's signature tell: a lowercase mono label opened by a dimmed `//`.
 * The `//` is drawn by CSS — pass only the words. Sits directly above a heading
 * on every title block, section opener and callout. Never ALL-CAPS.
 */
export function Eyebrow({ tone = 'brand', className, ...rest }: EyebrowProps) {
  return (
    <div
      className={cx(
        'sc-eyebrow',
        tone === 'accent' && 'sc-eyebrow--accent',
        tone === 'muted' && 'sc-eyebrow--muted',
        className,
      )}
      {...rest}
    />
  );
}
