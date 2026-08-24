import * as React from 'react';
import { cx } from './cx.js';

export interface FiltersProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The filter bar: one row, directly above everything it scopes, never beside it.
 * Fill it with `Field`s wrapping `Select` and `Input`, and bare `Checkbox`es
 * (a `Checkbox` is already a label — it does not go inside a `Field`).
 */
export const Filters = React.forwardRef<HTMLDivElement, FiltersProps>(function Filters({ className, ...rest }, ref) {
  return <div ref={ref} className={cx('sc-filters', className)} {...rest} />;
});
Filters.displayName = 'Filters';
