import * as React from 'react';
import { cx } from './cx';

export interface TileProps extends React.ComponentPropsWithoutRef<'div'> {
  /** What the figure counts. Sits above the value, muted. */
  label: React.ReactNode;
  /** The figure itself — proportional body sans, never the display face. */
  value: React.ReactNode;
  /** One line of context under the value, small mono. */
  sub?: React.ReactNode;
  /** The change line — pass a `Delta`. Always name the period it compares against. */
  delta?: React.ReactNode;
  /** Drop the value to 24px when the figure is words rather than a number. */
  small?: boolean;
}

/**
 * A stat tile: label · value · context · signed delta. The unit a dashboard
 * row is built from — group three or four inside a `Grid`.
 */
export function Tile({ label, value, sub, delta, small = false, className, children, ...rest }: TileProps) {
  return (
    <div className={cx('sc-tile', className)} {...rest}>
      <div className="sc-tile__label">{label}</div>
      <div className={cx('sc-tile__value', small && 'sc-tile__value--sm')}>{value}</div>
      {sub ? <div className="sc-tile__sub">{sub}</div> : null}
      {delta}
      {children}
    </div>
  );
}
