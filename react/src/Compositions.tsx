import * as React from 'react';
import { cx } from './cx.js';

export interface BentoProps extends React.ComponentPropsWithoutRef<'div'> {
  aside: React.ReactNode;
}

/** A lead region and supporting stack that wrap to their available width. */
export const Bento = React.forwardRef<HTMLDivElement, BentoProps>(function Bento(
  { aside, children, className, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-bento', className)} {...rest}>
    <div className="sc-bento__main">{children}</div>
    <div className="sc-bento__aside">{aside}</div>
  </div>;
});

export interface EditorialProps extends React.ComponentPropsWithoutRef<'section'> {
  art: React.ReactNode;
  /** Set only when the art repeats information already expressed in the copy. */
  decorativeArt?: boolean;
}

/** Copy and art occupy separate regions; supply the appropriate heading in children. */
export const Editorial = React.forwardRef<HTMLElement, EditorialProps>(function Editorial(
  { art, decorativeArt = false, children, className, ...rest }, ref,
) {
  return <section ref={ref} className={cx('sc-editorial', className)} {...rest}>
    <div className="sc-editorial__body">{children}</div>
    <div className="sc-editorial__art" aria-hidden={decorativeArt || undefined}>{art}</div>
  </section>;
});

export interface TimelineItem {
  id: string;
  stamp: React.ReactNode;
  /** A valid HTML datetime value, when the stamp represents a date or time. */
  dateTime?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}
export interface TimelineProps extends Omit<React.ComponentPropsWithoutRef<'ol'>, 'children'> {
  items: TimelineItem[];
  headingLevel?: 2 | 3 | 4;
}

/** Chronological evidence with a real ordered reading sequence. */
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items, headingLevel = 3, className, ...rest }, ref,
) {
  const Heading = headingLevel === 2 ? 'h2' : headingLevel === 4 ? 'h4' : 'h3';
  return <ol ref={ref} role="list" className={cx('sc-timeline', className)} {...rest}>
    {items.map(item => <li key={item.id} className="sc-timeline__item">
      {item.dateTime
        ? <time className="sc-timeline__stamp" dateTime={item.dateTime}>{item.stamp}</time>
        : <span className="sc-timeline__stamp">{item.stamp}</span>}
      <div className="sc-timeline__body">
        <Heading>{item.title}</Heading>
        {item.description != null && <p>{item.description}</p>}
      </div>
    </li>)}
  </ol>;
});

export interface QuoteProps extends React.ComponentPropsWithoutRef<'figure'> {
  source: React.ReactNode;
  /** Optional source URL for the quotation. */
  cite?: string;
}

/** An attributed quotation; use children for the quoted words and source for attribution. */
export const Quote = React.forwardRef<HTMLElement, QuoteProps>(function Quote(
  { source, cite, children, className, ...rest }, ref,
) {
  return <figure ref={ref} className={cx('sc-quote', className)} {...rest}>
    <blockquote className="sc-quote__text" cite={cite}>{children}</blockquote>
    <figcaption className="sc-quote__source">{source}</figcaption>
  </figure>;
});

export interface RankListItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  value: React.ReactNode;
}
export interface RankListProps extends Omit<React.ComponentPropsWithoutRef<'ol'>, 'children' | 'reversed'> {
  items: RankListItem[];
}

/** Positions follow the supplied order; the caller determines ranking and explains units. */
export const RankList = React.forwardRef<HTMLOListElement, RankListProps>(function RankList(
  { items, start = 1, className, ...rest }, ref,
) {
  return <ol ref={ref} role="list" start={start} className={cx('sc-rank-list', className)} {...rest}>
    {items.map((item, i) => <li key={item.id} className="sc-rank-list__item">
      <span className="sc-rank-list__position" aria-hidden="true">{start + i}</span>
      <div className="sc-rank-list__body">
        <strong>{item.title}</strong>
        {item.description != null && <span>{item.description}</span>}
      </div>
      <span className="sc-rank-list__value">{item.value}</span>
    </li>)}
  </ol>;
});

export interface StepperItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  state?: 'complete' | 'current' | 'upcoming';
}
export interface StepperProps extends Omit<React.ComponentPropsWithoutRef<'ol'>, 'children' | 'start' | 'reversed'> {
  items: StepperItem[];
  /** Visible status labels can be translated without changing state semantics. */
  stateLabels?: { complete: string; current: string; upcoming: string };
}

/** A status overview with explicit words. Navigation and progression stay with the application. */
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { items, stateLabels = { complete: 'Complete', current: 'Current step', upcoming: 'Next' }, className, ...rest }, ref,
) {
  return <ol ref={ref} role="list" className={cx('sc-stepper', className)} {...rest}>
    {items.map((item, i) => {
      const state = item.state ?? 'upcoming';
      return <li key={item.id} aria-current={state === 'current' ? 'step' : undefined}
        className={cx('sc-stepper__item', state === 'current' && 'is-current', state === 'complete' && 'is-complete')}>
        <span className="sc-stepper__index" aria-hidden="true">{state === 'complete' ? '✓' : i + 1}</span>
        <div className="sc-stepper__body">
          <strong>{item.title}</strong>
          <span>{stateLabels[state]}</span>
          {item.description != null && <span>{item.description}</span>}
        </div>
      </li>;
    })}
  </ol>;
});

export interface MetricSpotlightProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  context: React.ReactNode;
}

/** One lead figure with a readable label, unit and immediate context. */
export const MetricSpotlight = React.forwardRef<HTMLDivElement, MetricSpotlightProps>(function MetricSpotlight(
  { label, value, unit, context, className, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-metric-spotlight', className)} {...rest}>
    <div className="sc-eyebrow">{label}</div>
    <strong className="sc-metric-spotlight__value">{value}{unit != null && <small>{unit}</small>}</strong>
    <p className="sc-metric-spotlight__context">{context}</p>
  </div>;
});

export interface ComparisonItem {
  id: string;
  label: React.ReactNode;
  value: React.ReactNode;
  note?: React.ReactNode;
}
export interface ComparisonProps extends Omit<React.ComponentPropsWithoutRef<'dl'>, 'children'> {
  items: ComparisonItem[];
}

/** Parallel label/value pairs with equal emphasis and optional explanatory notes. */
export const Comparison = React.forwardRef<HTMLDListElement, ComparisonProps>(function Comparison(
  { items, className, ...rest }, ref,
) {
  return <dl ref={ref} className={cx('sc-comparison', className)} {...rest}>
    {items.map(item => <div key={item.id} className="sc-comparison__item">
      <dt className="sc-comparison__label">{item.label}</dt>
      <dd className="sc-comparison__value">{item.value}</dd>
      {item.note != null && <dd className="sc-comparison__note">{item.note}</dd>}
    </div>)}
  </dl>;
});

export interface RevealProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Reserve wipe for decorative art. Prefer rise or fade for reading content. */
  effect?: 'rise' | 'fade' | 'scale' | 'slide' | 'wipe';
}

/**
 * Visible by default, including SSR and reduced motion. The optional sc-motion.js
 * runtime enhances this marker and automatically discovers mounted elements.
 * A parent with className="sc-stagger" sequences direct Reveal children.
 */
export const Reveal = React.forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  { effect = 'rise', className, ...rest }, ref,
) {
  return <div ref={ref} className={cx('sc-reveal', className)} data-sc-motion={effect} {...rest} />;
});
