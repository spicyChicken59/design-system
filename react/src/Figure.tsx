import * as React from 'react';
import { cx } from './cx.js';

export interface FigureProps extends React.ComponentPropsWithoutRef<'span'> {}

/**
 * A figure inside a cell or a media aside: bold, heading colour, never wraps.
 * Add `sc-text-brand` via `className` for the derived figure (landed price)
 * the styleguide emphasises.
 */
export const Figure = React.forwardRef<HTMLSpanElement, FigureProps>(function Figure({ className, ...rest }, ref) {
  return <span ref={ref} className={cx('sc-figure', className)} {...rest} />;
});
Figure.displayName = 'Figure';

export interface NoteProps extends React.ComponentPropsWithoutRef<'span'> {}

/**
 * The small mono line under a figure or a name — "incl. $1,200 shipping",
 * a dealer name. Block-level, muted, 10.5px.
 */
export const Note = React.forwardRef<HTMLSpanElement, NoteProps>(function Note({ className, ...rest }, ref) {
  return <span ref={ref} className={cx('sc-note', className)} {...rest} />;
});
Note.displayName = 'Note';
