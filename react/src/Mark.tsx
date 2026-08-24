import * as React from 'react';
import { cx } from './cx.js';
import { SC_MARKS, type MarkForm } from './marks.generated.js';

export interface MarkProps extends Omit<React.ComponentPropsWithoutRef<'img'>, 'src'> {
  /**
   * Which form of the mark. `colorDark` on ink and dark surfaces, `colorLight`
   * on light ones, the mono forms for watermarks and single-colour uses.
   */
  form?: MarkForm;
  /** `md` is the standard 26px; `lg` is 48px for covers and title blocks. */
  size?: 'md' | 'lg';
}

/**
 * The SpicyChicken mark — the chick. Inlined, so it needs no network and no
 * asset path. Never recolour it, never stretch it, never rebuild it from parts.
 */
export const Mark = React.forwardRef<HTMLImageElement, MarkProps>(function Mark(
  { form = 'colorDark', size = 'md', className, alt = '', ...rest },
  ref,
) {
  return (
    <img
      ref={ref}
      className={cx('sc-mark', size === 'lg' && 'sc-mark--lg', className)}
      src={SC_MARKS[form]}
      alt={alt}
      {...rest}
    />
  );
});
Mark.displayName = 'Mark';
