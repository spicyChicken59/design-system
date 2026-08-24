import * as React from 'react';
import { cx } from './cx.js';

export interface SelectProps extends React.ComponentPropsWithoutRef<'select'> {}

/**
 * The select. Native element with the system's own chevron drawn in CSS —
 * pass `<option>` children as usual. Forwards its ref to the `<select>`.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cx('sc-select', className)} {...rest} />;
});
Select.displayName = 'Select';
