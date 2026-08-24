import * as React from 'react';
import { cx } from './cx';
import { Mark } from './Mark';
import type { MarkForm } from './marks.generated';

export interface BrandProps extends React.ComponentPropsWithoutRef<'a'> {
  /** The project's name — this leads, the brand only endorses. */
  name: React.ReactNode;
  /** What the project is, in about four words. Lowercase mono under the name. */
  sub?: React.ReactNode;
  /** Which mark form to show. Mastheads are ink, so the default suits them. */
  form?: MarkForm;
}

/**
 * The project lockup that opens a masthead: mark, name, and a four-word
 * description. The project's name is the big one — SpicyChicken endorses from
 * the footer, never from here.
 */
export function Brand({ name, sub, form = 'colorDark', className, href = './', ...rest }: BrandProps) {
  return (
    <a className={cx('sc-brand', className)} href={href} {...rest}>
      <Mark form={form} />
      <span>
        <span className="sc-brand__name">{name}</span>
        {sub ? <span className="sc-brand__sub">{sub}</span> : null}
      </span>
    </a>
  );
}
