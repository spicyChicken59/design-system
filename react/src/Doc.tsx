import * as React from 'react';
import { cx } from './cx.js';

export interface DocProps extends React.ComponentPropsWithoutRef<'article'> {
  /** Prose straight on the page — no card surface, border or padding. */
  flat?: boolean;
}

/**
 * The on-screen document surface — 800px of prose on a card, with every `h2`
 * opening under a cobalt rule, 68ch paragraphs and spaced list items. Use it
 * for memos, reports and READMEs on screen; `flat` for a plain reading page.
 */
export const Doc = React.forwardRef<HTMLElement, DocProps>(function Doc({ flat = false, className, ...rest }, ref) {
  return <article ref={ref} className={cx('sc-doc', flat && 'sc-doc--flat', className)} {...rest} />;
});
Doc.displayName = 'Doc';
