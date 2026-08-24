import * as React from 'react';
import { cx } from './cx.js';

export interface StackProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Vertical rhythm: puts 16px between every child, nothing above the first.
 * The default way to space stacked blocks inside a card or section.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(function Stack({ className, ...rest }, ref) {
  return <div ref={ref} className={cx('sc-stack', className)} {...rest} />;
});
Stack.displayName = 'Stack';
