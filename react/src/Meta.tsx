import * as React from 'react';
import { cx } from './cx.js';

export interface MetaProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The facts, in order. Rendered as a mono row joined by dimmed `·` separators. */
  items: React.ReactNode[];
}

/**
 * The provenance row under a title block: updated date, source, method.
 * Small mono, muted, separated by `·`.
 */
export const Meta = React.forwardRef<HTMLDivElement, MetaProps>(function Meta({ items, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx('sc-meta', className)} {...rest}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 ? <span className="sc-sep">·</span> : null}
          <span>{item}</span>
        </React.Fragment>
      ))}
    </div>
  );
});
Meta.displayName = 'Meta';
