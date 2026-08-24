import * as React from 'react';
import { cx } from './cx.js';
import { Watermark } from './Watermark.js';

export interface FooterProps extends React.ComponentPropsWithoutRef<'footer'> {
  /** The provenance line on the left: source · method · last updated. Every page has one. */
  source?: React.ReactNode;
  /** Right-hand slot. Defaults to the standard `Watermark` — leave it alone. */
  watermark?: React.ReactNode;
}

/**
 * The page foot: where the data came from on the left, the brand watermark on
 * the right. Every page ends with one. Ink-dark in both themes. `children` are
 * rendered after `source` in the same left slot; the slot is omitted when both
 * are empty.
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(function Footer(
  { source, watermark, className, children, ...rest },
  ref,
) {
  const hasSource = source != null && source !== false;
  const hasChildren = children != null && children !== false;
  return (
    <footer ref={ref} className={cx('sc-foot', className)} {...rest}>
      {hasSource || hasChildren ? (
        <span>
          {hasSource ? source : null}
          {hasChildren ? children : null}
        </span>
      ) : null}
      {watermark ?? <Watermark />}
    </footer>
  );
});
Footer.displayName = 'Footer';
