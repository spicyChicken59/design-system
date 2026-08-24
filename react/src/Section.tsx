import * as React from 'react';
import { cx } from './cx';

export interface SectionProps extends React.ComponentPropsWithoutRef<'section'> {}

/**
 * A page section. Carries the standard 48px top rhythm between blocks —
 * use it instead of ad-hoc margins so vertical spacing stays on the 8px grid.
 */
export function Section({ className, ...rest }: SectionProps) {
  return <section className={cx('sc-section', className)} {...rest} />;
}
