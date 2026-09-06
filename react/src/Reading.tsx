import * as React from 'react';
import { cx } from './cx.js';

export interface ChapterNavItem { id: string; href: string; label: React.ReactNode; index?: React.ReactNode }
export interface ChapterNavProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'children'> {
  items: ChapterNavItem[];
  rail?: boolean;
}
/** Native anchors work without JS. sc-reading.js optionally indicates location. */
export const ChapterNav = React.forwardRef<HTMLElement, ChapterNavProps>(function ChapterNav(
  { items, rail = false, className, 'aria-label': label = 'On this page', ...rest }, ref,
) {
  return <nav ref={ref} className={cx('sc-chapter-nav', rail && 'sc-chapter-nav--rail', className)} data-sc-reading aria-label={label} {...rest}>
    {items.map(item => <a key={item.id} href={item.href}>{item.index != null && <span className="sc-chapter-nav__index">{item.index}</span>}{item.label}</a>)}
  </nav>;
});

export interface ReadingProps extends React.ComponentPropsWithoutRef<'div'> { navigation: React.ReactNode }
export const Reading = React.forwardRef<HTMLDivElement, ReadingProps>(function Reading(
  { navigation, children, className, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-reading', className)} {...rest}>{navigation}<div className="sc-reading__body">{children}</div></div>;
});

export interface EvidenceProps extends React.ComponentPropsWithoutRef<'figure'> { source: React.ReactNode }
/** Put the caller's chart and accessible table inside; this wrapper never invents data. */
export const Evidence = React.forwardRef<HTMLElement, EvidenceProps>(function Evidence(
  { source, children, className, ...rest }, ref,
) {
  return <figure ref={ref} className={cx('sc-evidence', className)} {...rest}><div className="sc-evidence__plot">{children}</div><figcaption className="sc-evidence__source">{source}</figcaption></figure>;
});

export const Insight = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function Insight(
  { className, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-insight', className)} {...rest} />;
});
