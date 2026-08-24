import * as React from 'react';
import { cx } from './cx';

export interface DeltaProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * What the movement means — not which way it points. A falling error rate is
   * `good`. `bad` reads amber, not red: red is reserved for danger states.
   */
  tone?: 'good' | 'bad' | 'flat';
  /** Prepends the direction glyph the system requires (▲ ▼ —). */
  arrow?: 'up' | 'down' | 'flat';
}

/**
 * The change line under a tile value. Colour carries the judgement, the glyph
 * carries the direction, and the words carry the period — all three, always.
 */
export function Delta({ tone = 'flat', arrow, className, children, ...rest }: DeltaProps) {
  const glyph = arrow === 'up' ? '▲ ' : arrow === 'down' ? '▼ ' : arrow === 'flat' ? '— ' : null;
  return (
    <div className={cx('sc-delta', `sc-delta--${tone}`, className)} {...rest}>
      {glyph}
      {children}
    </div>
  );
}
