import * as React from 'react';
import { cx } from './cx';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<'input'> {
  /** The clickable label text sitting beside the box. */
  label: React.ReactNode;
}

/**
 * A checkbox and its label as one target. The box takes the spice accent colour
 * when checked.
 */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx('sc-check', className)}>
      <input type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
}
