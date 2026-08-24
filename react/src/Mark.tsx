import * as React from 'react';
import { cx } from './cx';
import { SC_MARKS, type MarkForm } from './marks.generated';

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
export function Mark({ form = 'colorDark', size = 'md', className, alt = '', ...rest }: MarkProps) {
  return (
    <img
      className={cx('sc-mark', size === 'lg' && 'sc-mark--lg', className)}
      src={SC_MARKS[form]}
      alt={alt}
      {...rest}
    />
  );
}
