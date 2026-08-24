import * as React from 'react';
import { cx } from './cx';

export interface FiltersProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The filter bar: one row, directly above everything it scopes, never beside it.
 * Fill it with `Field`s wrapping `Select`, `Input` and `Checkbox`.
 */
export function Filters({ className, ...rest }: FiltersProps) {
  return <div className={cx('sc-filters', className)} {...rest} />;
}
