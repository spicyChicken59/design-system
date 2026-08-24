import * as React from 'react';
import { cx } from './cx';

export interface SelectProps extends React.ComponentPropsWithoutRef<'select'> {}

/**
 * The select. Native element with the system's own chevron drawn in CSS —
 * pass `<option>` children as usual.
 */
export function Select({ className, ...rest }: SelectProps) {
  return <select className={cx('sc-select', className)} {...rest} />;
}
