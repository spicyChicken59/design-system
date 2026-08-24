import * as React from 'react';
import { cx } from './cx.js';

interface ButtonBase {
  /**
   * `primary` is spice and there is exactly one per view — the hot action.
   * `secondary` is the cobalt outline, `ghost` is for tertiary and toolbar use.
   */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Compact size for card heads and dense toolbars. */
  size?: 'md' | 'sm';
}

/** The anchor form: `href` plus every `<a>` attribute (`target`, `rel`, `download`…). */
export type ButtonAnchorProps = ButtonBase &
  Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & {
    /** Render as an anchor pointing here. */
    href: string;
    /** A disabled link renders `aria-disabled`, leaves the tab order and drops its `href`. */
    disabled?: boolean;
  };

/** Attributes only an `<a>` has (`target`, `download`, `rel`…) — refused on the button form. */
type AnchorOnly = Exclude<keyof React.ComponentPropsWithoutRef<'a'>, keyof React.ComponentPropsWithoutRef<'button'>>;

/** The button form: every `<button>` attribute; `type` defaults to `"button"`. */
export type ButtonButtonProps = ButtonBase &
  React.ComponentPropsWithoutRef<'button'> & {
    href?: undefined;
  } & { [K in AnchorOnly]?: never };

export type ButtonProps = ButtonAnchorProps | ButtonButtonProps;

/**
 * The action control. Primary is the page's single hot action; everything else
 * is secondary or ghost. Label buttons with a verb, and end a page with one.
 * With `href` it renders an `<a>` (and adds `rel="noopener"` to `target="_blank"`).
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  props,
  ref,
) {
  const { variant = 'secondary', size = 'md', className } = props;
  const classes = cx('sc-btn', `sc-btn--${variant}`, size === 'sm' && 'sc-btn--sm', className);

  if (props.href !== undefined) {
    const { variant: _v, size: _s, className: _c, href, disabled, target, rel, ...rest } = props;
    const safeRel = target === '_blank' && !rel ? 'noopener' : rel;
    if (disabled) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          aria-disabled="true"
          tabIndex={-1}
          target={target}
          rel={safeRel}
          {...rest}
        />
      );
    }
    return <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} href={href} target={target} rel={safeRel} {...rest} />;
  }

  const { variant: _v, size: _s, className: _c, href: _h, type = 'button', ...rest } = props;
  return <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} type={type} {...rest} />;
});
Button.displayName = 'Button';
