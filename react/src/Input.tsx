import * as React from 'react';
import { cx } from './cx.js';

export interface InputProps extends React.ComponentPropsWithoutRef<'input'> {}

/**
 * The text input. Control-strength border that warms to cobalt on hover, spice
 * focus ring from the base stylesheet; `aria-invalid` turns the border danger,
 * `readOnly` sits on the raised surface. Pair it with `Field` to get a label.
 * Forwards its ref to the `<input>` for form libraries.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...rest },
  ref,
) {
  return <input ref={ref} type={type} className={cx('sc-input', className)} {...rest} />;
});
Input.displayName = 'Input';
