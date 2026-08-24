import * as React from 'react';
import { cx } from './cx.js';

export interface SectionProps extends React.ComponentPropsWithoutRef<'section'> {}

/**
 * A page section. Carries the standard 48px top rhythm between blocks —
 * use it instead of ad-hoc margins so vertical spacing stays on the 8px grid.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section({ className, ...rest }, ref) {
  return <section ref={ref} className={cx('sc-section', className)} {...rest} />;
});
Section.displayName = 'Section';
