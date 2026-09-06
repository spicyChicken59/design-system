import * as React from 'react';
import { cx } from './cx.js';
import { Mark } from './Mark.js';

/** Original colour forms selected by the surface theme, without runtime JS. */
export function AdaptiveMark() {
  return <span className="sc-adaptive-mark" aria-hidden="true">
    <Mark className="sc-adaptive-mark__dark" form="colorDark" />
    <Mark className="sc-adaptive-mark__light" form="colorLight" />
  </span>;
}

export interface CoverProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  tone?: 'ink' | 'wine' | 'paper';
  compact?: boolean;
  headingLevel?: 1 | 2;
}

/** A branded opener. The unchanged chick has its own column, clear of copy. */
export const Cover = React.forwardRef<HTMLElement, CoverProps>(function Cover(
  { title, eyebrow, description, meta, actions, tone = 'ink', compact = false,
    headingLevel = 1, className, children, ...rest }, ref,
) {
  const Heading = headingLevel === 2 ? 'h2' : 'h1';
  return <section ref={ref} className={cx('sc-cover', tone !== 'paper' && 'sc-on-ink',
    tone !== 'ink' && `sc-cover--${tone}`, compact && 'sc-cover--compact', className)} {...rest}>
    <div className="sc-cover__content">
      {eyebrow && <div className="sc-eyebrow">{eyebrow}</div>}
      <Heading className="sc-cover__title">{title}</Heading>
      {description && <p className="sc-cover__dek">{description}</p>}
      {meta && <div className="sc-cover__meta">{meta}</div>}
      {actions && <div className="sc-cover__actions">{actions}</div>}
      {children}
    </div>
    <div className="sc-cover__art" aria-hidden="true">
      <Mark form={tone === 'paper' ? 'colorLight' : tone === 'wine' ? 'monoCream' : 'colorDark'} />
      <span className="sc-cover__caption">a SpicyChicken creation</span>
    </div>
  </section>;
});

export interface GhostProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Use a fixed surface only when the host stays ink/paper in both modes. */
  surface?: 'auto' | 'ink' | 'paper';
}
/** Decorative only. Reserve a blank panel; never overlay a plot or body copy. */
export const Ghost = React.forwardRef<HTMLDivElement, GhostProps>(function Ghost(
  { surface = 'auto', className, ...rest }, ref,
) {
  return <div {...rest} ref={ref} className={cx('sc-ghost', surface !== 'auto' && `sc-ghost--${surface}`, className)} aria-hidden="true">
    <Mark form="monoCream" className="sc-ghost__dark" />
    <Mark form="monoInk" className="sc-ghost__light" />
  </div>;
});

export interface SignatureProps extends React.ComponentPropsWithoutRef<'a'> {
  subtitle?: React.ReactNode;
  small?: boolean;
  surface?: 'auto' | 'ink' | 'paper';
}
/** A legible maker's signature for report footers and chart captions. */
export const Signature = React.forwardRef<HTMLAnchorElement, SignatureProps>(function Signature(
  { subtitle = 'made with intent', small = false, surface = 'auto', className,
    href = 'https://github.com/spicyChicken59', ...rest }, ref,
) {
  return <a ref={ref} href={href} rel="author" className={cx('sc-signature', small && 'sc-signature--small', className)} {...rest}>
    {surface === 'auto' ? <AdaptiveMark /> : <Mark form={surface === 'paper' ? 'colorLight' : 'colorDark'} />}
    <span><span className="sc-signature__name">SpicyChicken</span>
      {subtitle && <span className="sc-signature__sub">{subtitle}</span>}</span>
  </a>;
});

export interface ChapterProps extends Omit<React.ComponentPropsWithoutRef<'header'>, 'title'> {
  title: React.ReactNode;
  index?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  headingLevel?: 2 | 3;
}
export const Chapter = React.forwardRef<HTMLElement, ChapterProps>(function Chapter(
  { title, index, description, meta, headingLevel = 2, className, ...rest }, ref,
) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  return <header ref={ref} className={cx('sc-chapter', className)} {...rest}>
    {index && <span className="sc-chapter__index" aria-hidden="true">{index}</span>}
    <div className="sc-chapter__body"><Heading>{title}</Heading>{description && <p>{description}</p>}</div>
    {meta && <span className="sc-chapter__meta">{meta}</span>}
  </header>;
});

export interface StatStripProps extends React.ComponentPropsWithoutRef<'dl'> { columns?: 2 | 3 | 4 }
export const StatStrip = React.forwardRef<HTMLDListElement, StatStripProps>(function StatStrip(
  { columns = 3, className, ...rest }, ref,
) {
  return <dl ref={ref} className={cx('sc-stat-strip', columns !== 3 && `sc-stat-strip--${columns}`, className)} {...rest} />;
});
export interface StatProps extends React.ComponentPropsWithoutRef<'div'> {
  label: React.ReactNode;
  value: React.ReactNode;
  note?: React.ReactNode;
  lead?: boolean;
}
/** Render only within StatStrip (a dl); the unit/context stays beside the value. */
export const Stat = React.forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, note, lead = false, className, children, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-stat', lead && 'sc-stat--lead', className)} {...rest}>
    <dt className="sc-stat__label">{label}</dt><dd className="sc-stat__value">{value}</dd>
    {note && <dd className="sc-stat__note">{note}</dd>}{children}
  </div>;
});

export interface FactsProps extends React.ComponentPropsWithoutRef<'dl'> {
  items: Array<{ label: React.ReactNode; value: React.ReactNode }>;
}
export const Facts = React.forwardRef<HTMLDListElement, FactsProps>(function Facts(
  { items, className, ...rest }, ref,
) {
  return <dl ref={ref} className={cx('sc-facts', className)} {...rest}>
    {items.map((item, i) => <div key={i}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
  </dl>;
});

export interface BrandedEmptyProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
}
export const BrandedEmpty = React.forwardRef<HTMLDivElement, BrandedEmptyProps>(function BrandedEmpty(
  { title, description, action, className, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-empty', 'sc-empty--brand', className)} {...rest}>
    <AdaptiveMark /><h3>{title}</h3><p>{description}</p>{action}
  </div>;
});
