import * as React from 'react';
import { cx } from './cx';

export interface HeroProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The one number a page leads with, at 56px. Exactly one per view —
 * if two figures compete for the lead, neither is the lead.
 */
export function Hero({ className, ...rest }: HeroProps) {
  return <div className={cx('sc-hero', className)} {...rest} />;
}
