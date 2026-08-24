import * as React from 'react';
import { cx } from './cx';

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
export function Wrap({ width = 'content', as = 'div', className, ...rest }: WrapProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cx(
        'sc-wrap',
        width === 'wide' && 'sc-wrap--wide',
        width === 'prose' && 'sc-wrap--prose',
        className,
      )}
      {...rest}
    />
  );
}
