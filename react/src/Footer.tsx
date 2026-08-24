import * as React from 'react';
import { cx } from './cx';
import { Watermark } from './Watermark';

export interface FooterProps extends React.ComponentPropsWithoutRef<'footer'> {
  /** The provenance line on the left: source · method · last updated. */
  source?: React.ReactNode;
  /** Right-hand slot. Defaults to the standard `Watermark` — leave it alone. */
  watermark?: React.ReactNode;
}

/**
 * The page foot: where the data came from on the left, the brand watermark on
 * the right. Every page ends with one. Ink-dark in both themes.
 */
export function Footer({ source, watermark, className, children, ...rest }: FooterProps) {
  return (
    <footer className={cx('sc-foot', className)} {...rest}>
      <span>{source ?? children}</span>
      {watermark ?? <Watermark />}
    </footer>
  );
}
