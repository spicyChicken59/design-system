import * as React from 'react';
import { cx } from './cx.js';

export interface TitleProps extends React.ComponentPropsWithoutRef<'div'> {}

/**
 * The title block that opens a page: `Eyebrow`, `h1`, `Dek`, `Meta`, and an
 * optional `Tabs` row underneath (the stylesheet spaces it). Carries the
 * 40px-over-8px padding every page used to hand-roll; 24px on phones.
 */
export const Title = React.forwardRef<HTMLDivElement, TitleProps>(function Title({ className, ...rest }, ref) {
  return <div ref={ref} className={cx('sc-title', className)} {...rest} />;
});
Title.displayName = 'Title';
