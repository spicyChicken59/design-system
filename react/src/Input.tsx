import * as React from 'react';
import { cx } from './cx';

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {}

/**
 * The text input. Hairline border that warms to cobalt on hover, spice focus
 * ring from the base stylesheet. Pair it with `Field` to get a label.
 */
export function Input({ className, type = 'text', ...rest }: InputProps) {
  return <input type={type} className={cx('sc-input', className)} {...rest} />;
}
