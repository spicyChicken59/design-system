import * as React from 'react';
import { cx } from './cx.js';

export interface FrameProps extends Omit<React.ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> {
  /** The photo. Omit it to render the empty twin. */
  src?: string;
  /** What the photo shows. Empty string when it is decorative beside its own caption. */
  alt: string;
  /** What the empty twin says — lowercase, two words at most. */
  empty?: React.ReactNode;
  /** `md` is 56×40; `lg` is 120×80 for a lead card. */
  size?: 'md' | 'lg';
}

/**
 * The photo slot: a hairline-bordered, 6px-radius frame on the raised surface,
 * cropped with `object-fit: cover`. Without `src` it renders the empty twin —
 * the same box saying "no photo" — so rows keep their shape.
 */
export const Frame = React.forwardRef<HTMLImageElement | HTMLDivElement, FrameProps>(function Frame(
  { src, alt, empty = 'no photo', size = 'md', className, loading, decoding, srcSet, sizes, crossOrigin, referrerPolicy, useMap, width, height, ...rest },
  ref,
) {
  const classes = cx('sc-frame', size === 'lg' && 'sc-frame--lg', className);
  if (src) {
    return (
      <img
        ref={ref as React.Ref<HTMLImageElement>}
        className={classes}
        src={src}
        alt={alt}
        {...{ loading, decoding, srcSet, sizes, crossOrigin, referrerPolicy, useMap, width, height }}
        {...rest}
      />
    );
  }
  const divProps = rest as React.ComponentPropsWithoutRef<'div'>;
  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={cx(classes, 'sc-frame--empty')} {...divProps}>
      {empty}
    </div>
  );
});
Frame.displayName = 'Frame';
