import * as React from 'react';
import { cx } from './cx';

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  /**
   * `primary` is spice and there is exactly one per view — the hot action.
   * `secondary` is the cobalt outline, `ghost` is for tertiary and toolbar use.
   */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Compact size for card heads and dense toolbars. */
  size?: 'md' | 'sm';
  /** Render as an anchor. Pass `href` alongside it. */
  href?: string;
}

/**
 * The action control. Primary is the page's single hot action; everything else
 * is secondary or ghost. Label buttons with a verb, and end a page with one.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  href,
  className,
  ...rest
}: ButtonProps) {
  const Tag = (href ? 'a' : 'button') as React.ElementType;
  const classes = cx('sc-btn', `sc-btn--${variant}`, size === 'sm' && 'sc-btn--sm', className);
  return <Tag className={classes} href={href} type={href ? undefined : 'button'} {...rest} />;
}
