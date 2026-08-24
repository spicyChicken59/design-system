import * as React from 'react';
import { cx } from './cx';

export interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Target column count. Columns are responsive (`auto-fit`), so this is the
   * densest the row gets: `2` wraps below 280px per cell, `3` below 220px, `4` below 180px.
   */
  cols?: 2 | 3 | 4;
}

/**
 * The 16px-gutter grid used for tile rows and card decks.
 * Columns collapse on their own — never add media queries around it.
 */
export function Grid({ cols = 3, className, ...rest }: GridProps) {
  return <div className={cx('sc-grid', `sc-grid--${cols}`, className)} {...rest} />;
}
