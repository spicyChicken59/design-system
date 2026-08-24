import * as React from 'react';
import { cx } from './cx';

export interface DekProps extends React.ComponentPropsWithoutRef<'p'> {}

/**
 * The standfirst under an h1 — one sentence, 18px, muted, capped at 760px.
 * State the outcome and the reason; never the hype.
 */
export function Dek({ className, ...rest }: DekProps) {
  return <p className={cx('sc-dek', className)} {...rest} />;
}
