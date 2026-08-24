import * as React from 'react';
import { cx } from './cx.js';

export interface FieldProps extends React.ComponentPropsWithoutRef<'label'> {
  /** The lowercase mono label. Keep it to one or two words. */
  label: React.ReactNode;
}

/**
 * A labelled control: mono label on the left, the control beside it. Wrap a
 * `Select` or an `Input`. The unit `Filters` rows are built from.
 * `Checkbox` is its own label — place it beside a `Field`, never inside one.
 */
export const Field = React.forwardRef<HTMLLabelElement, FieldProps>(function Field(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <label ref={ref} className={cx('sc-field', className)} {...rest}>
      <span>{label}</span>
      {children}
    </label>
  );
});
Field.displayName = 'Field';
