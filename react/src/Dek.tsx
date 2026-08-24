import * as React from 'react';
import { cx } from './cx.js';

export interface DekProps extends React.ComponentPropsWithoutRef<'p'> {}

/**
 * The standfirst under an h1 — one sentence, 18px, muted, capped at 760px.
 * State the outcome and the reason; never the hype.
 */
export const Dek = React.forwardRef<HTMLParagraphElement, DekProps>(function Dek({ className, ...rest }, ref) {
  return <p ref={ref} className={cx('sc-dek', className)} {...rest} />;
});
Dek.displayName = 'Dek';
