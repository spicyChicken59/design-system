import * as React from 'react';
import { cx } from './cx.js';

export interface SepProps extends React.ComponentPropsWithoutRef<'span'> {}

/**
 * The divider between masthead items (a 1px ink line) — hidden from assistive
 * tech. `Meta` draws its own `·` separators; this one is for the masthead's
 * right-hand slot: `Nav`, `Sep`, `ThemeToggle`.
 */
export const Sep = React.forwardRef<HTMLSpanElement, SepProps>(function Sep({ className, ...rest }, ref) {
  return <span ref={ref} className={cx('sc-sep', className)} aria-hidden="true" {...rest} />;
});
Sep.displayName = 'Sep';
