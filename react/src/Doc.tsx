import * as React from 'react';
import { cx } from './cx';

export interface DocProps extends React.ComponentPropsWithoutRef<'article'> {}

/**
 * The on-screen document surface — 800px of prose on a card, with every `h2`
 * opening under a cobalt rule. Use it for memos, reports and READMEs on screen.
 */
export function Doc({ className, ...rest }: DocProps) {
  return <article className={cx('sc-doc', className)} {...rest} />;
}
