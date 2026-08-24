import * as React from 'react';
import { cx } from './cx.js';
import { Mark } from './Mark.js';

export interface WatermarkProps extends React.ComponentPropsWithoutRef<'a'> {
  /** The brand name beside the mark. Leave it as SpicyChicken. */
  name?: React.ReactNode;
}

/**
 * The brand endorsement, bottom-right of every page. Always the same mark, the
 * same size, the same place — it is a signature, not a logo placement. The
 * stylesheet sizes the mark (`.sc-watermark img.sc-mark`); nothing inline.
 */
export const Watermark = React.forwardRef<HTMLAnchorElement, WatermarkProps>(function Watermark(
  { name = 'SpicyChicken', className, href = 'https://github.com/spicyChicken59', ...rest },
  ref,
) {
  return (
    <a ref={ref} className={cx('sc-watermark', className)} href={href} rel="author" {...rest}>
      <Mark form="monoCream" />
      <span className="sc-watermark__name">{name}</span>
    </a>
  );
});
Watermark.displayName = 'Watermark';
