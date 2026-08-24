import * as React from 'react';
import { cx } from './cx.js';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<'input'> {
  /** The clickable label text sitting beside the box. */
  label: React.ReactNode;
}

/**
 * A checkbox and its label as one target: `label.sc-check` wrapping the input.
 * The box takes the spice accent colour when checked and the label wears the
 * same lowercase mono as `Field`.
 *
 * `className` and `style` go on the `<label>` wrapper; every other prop
 * (`id`, `name`, `checked`, `onChange`, `aria-*`…) and the ref go on the
 * `<input>`. It is already a label — never nest it inside `Field`.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, style, type: _type, ...rest },
  ref,
) {
  return (
    <label className={cx('sc-check', className)} style={style}>
      <input ref={ref} type="checkbox" {...rest} />
      <span>{label}</span>
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
