import * as React from 'react';
import { cx } from './cx.js';

export interface HeroProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The one number a page leads with, at 56px. Exactly one per view —
 * if two figures compete for the lead, neither is the lead.
 */
export const Hero = React.forwardRef<HTMLDivElement, HeroProps>(function Hero({ className, ...rest }, ref) {
  return <div ref={ref} className={cx('sc-hero', className)} {...rest} />;
});
Hero.displayName = 'Hero';
