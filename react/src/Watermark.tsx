import * as React from 'react';
import { cx } from './cx';
import { Mark } from './Mark';

export interface WatermarkProps extends React.ComponentPropsWithoutRef<'a'> {
  /** The brand name beside the mark. Leave it as SpicyChicken. */
  name?: React.ReactNode;
}

/**
 * The brand endorsement, bottom-right of every page. Always the same mark, the
 * same size, the same place — it is a signature, not a logo placement.
 */
export function Watermark({
  name = 'SpicyChicken',
  className,
  href = 'https://github.com/spicyChicken59',
  ...rest
}: WatermarkProps) {
  return (
    <a className={cx('sc-watermark', className)} href={href} rel="author" {...rest}>
      <Mark form="monoCream" style={{ height: 20 }} />
      <span className="sc-watermark__name">{name}</span>
    </a>
  );
}
