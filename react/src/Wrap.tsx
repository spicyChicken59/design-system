import * as React from 'react';
import { cx } from './cx.js';

export interface WrapProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Measure: `content` 1120px (default), `wide` 1280px for dashboards and tables, `prose` 800px for reading. */
  width?: 'content' | 'wide' | 'prose';
  /** Element to render. Use `main` for the page's primary region. */
  as?: 'div' | 'main' | 'section' | 'article';
}

/**
 * The page's horizontal measure — centres its children and holds the gutter.
 * Every page region sits inside one; nothing wider nests within it.
 */
export const Wrap = React.forwardRef<HTMLElement, WrapProps>(function Wrap(
  { width = 'content', as = 'div', className, ...rest },
  ref,
) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={cx('sc-wrap', width === 'wide' && 'sc-wrap--wide', width === 'prose' && 'sc-wrap--prose', className)}
      {...rest}
    />
  );
});
Wrap.displayName = 'Wrap';
