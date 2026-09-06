import * as React from 'react';
import { cx } from './cx.js';

export const SheetStack = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'main'>>(function SheetStack({ className, ...rest }, ref) {
  return <main ref={ref} className={cx('sc-sheet-stack', className)} {...rest} />;
});

export interface SheetProps extends React.ComponentPropsWithoutRef<'article'> { cover?: boolean; dense?: boolean; preview?: boolean }
export const Sheet = React.forwardRef<HTMLElement, SheetProps>(function Sheet({ cover = false, dense = false, preview = false, className, ...rest }, ref) {
  return <article ref={ref} className={cx('sc-sheet', cover && 'sc-sheet--cover sc-on-ink', dense && 'sc-sheet--dense', preview && 'sc-sheet--preview', className)} {...rest} />;
});

export const SheetHead = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'header'>>(function SheetHead({ className, ...rest }, ref) {
  return <header ref={ref} className={cx('sc-sheet__head', className)} {...rest} />;
});

export const SheetBody = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function SheetBody({ className, ...rest }, ref) {
  return <div ref={ref} className={cx('sc-sheet__body', className)} {...rest} />;
});

export interface SheetFootProps extends React.ComponentPropsWithoutRef<'footer'> { folio?: React.ReactNode }
export const SheetFoot = React.forwardRef<HTMLElement, SheetFootProps>(function SheetFoot({ folio, children, className, ...rest }, ref) {
  return <footer ref={ref} className={cx('sc-sheet__foot', className)} {...rest}>{children}{folio != null && <span className="sc-sheet__folio">{folio}</span>}</footer>;
});
