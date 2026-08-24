import * as React from 'react';
import { cx } from './cx.js';

export interface ChipProps extends React.ComponentPropsWithoutRef<'span'> {
  /**
   * Tone reinforces the meaning the word already carries. `danger` is the
   * outline form — it means stop and check. `info` is the neutral-blue note.
   * `solid` is the filled brand chip.
   */
  tone?: 'brand' | 'neutral' | 'spice' | 'good' | 'warn' | 'danger' | 'info' | 'solid';
  /** Keep the label's own casing for codes and proper nouns (VIN, TX, BMW i5). */
  keepCase?: boolean;
}

/**
 * A squared lowercase mono pill for status and category. The word must say the
 * meaning on its own — colour only reinforces it, and never replaces it.
 */
export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  { tone = 'neutral', keepCase = false, className, ...rest },
  ref,
) {
  return <span ref={ref} className={cx('sc-chip', `sc-chip--${tone}`, keepCase && 'sc-chip--case', className)} {...rest} />;
});
Chip.displayName = 'Chip';
