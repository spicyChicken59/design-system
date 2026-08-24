import * as React from 'react';
import { cx } from './cx';

export interface FieldProps extends React.ComponentPropsWithoutRef<'label'> {
  /** The lowercase mono label. Keep it to one or two words. */
  label: React.ReactNode;
}

/**
 * A labelled control: mono label on the left, the control beside it.
 * The unit `Filters` rows are built from.
 */
export function Field({ label, className, children, ...rest }: FieldProps) {
  return (
    <label className={cx('sc-field', className)} {...rest}>
      <span>{label}</span>
      {children}
    </label>
  );
}
