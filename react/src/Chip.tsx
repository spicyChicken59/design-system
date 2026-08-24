import * as React from 'react';
import { cx } from './cx';

export interface ChipProps extends React.ComponentPropsWithoutRef<'span'> {
  /**
   * Tone reinforces the meaning the word already carries. `danger` is the
   * outline form — it means stop and check. `solid` is the filled brand chip.
   */
  tone?: 'brand' | 'neutral' | 'spice' | 'good' | 'warn' | 'danger' | 'solid';
}

/**
 * A squared lowercase mono pill for status and category. The word must say the
 * meaning on its own — colour only reinforces it, and never replaces it.
 */
export function Chip({ tone = 'neutral', className, ...rest }: ChipProps) {
  return <span className={cx('sc-chip', `sc-chip--${tone}`, className)} {...rest} />;
}
