import * as React from 'react';
import { cx } from './cx.js';

export interface DeltaProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * What the movement means — not which way it points. A falling error rate is
   * `good`. `bad` reads amber, not red: red is reserved for danger states.
   */
  tone?: 'good' | 'bad' | 'flat';
  /** The direction glyph the system requires (▲ ▼ —). Required: colour never carries direction alone. */
  arrow: 'up' | 'down' | 'flat';
}

/**
 * The change line under a tile value. Colour carries the judgement, the glyph
 * carries the direction, and the words carry the period — all three, always.
 */
export const Delta = React.forwardRef<HTMLDivElement, DeltaProps>(function Delta(
  { tone = 'flat', arrow, className, children, ...rest },
  ref,
) {
  const glyph = arrow === 'up' ? '▲ ' : arrow === 'down' ? '▼ ' : '— ';
  return (
    <div ref={ref} className={cx('sc-delta', `sc-delta--${tone}`, className)} {...rest}>
      {glyph}
      {children}
    </div>
  );
});
Delta.displayName = 'Delta';
