import * as React from 'react';
import { cx } from './cx';

export interface StackProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * Vertical rhythm: puts 16px between every child, nothing above the first.
 * The default way to space stacked blocks inside a card or section.
 */
export function Stack({ className, ...rest }: StackProps) {
  return <div className={cx('sc-stack', className)} {...rest} />;
}
