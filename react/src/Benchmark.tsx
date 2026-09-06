import * as React from 'react';
import { cx } from './cx.js';

export type BenchmarkTone = 'emphasis' | 'good' | 'caution' | 'danger' | 'info';

export interface BenchmarkProps extends Omit<React.ComponentPropsWithoutRef<'figure'>, 'children'> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Marker position on the authored scale, from 0 through 100. */
  position: number;
  /** Three visible scale labels: start, reference or midpoint, and end. */
  scale: [React.ReactNode, React.ReactNode, React.ReactNode];
  reference?: number;
  band?: { start: number; end: number };
  tone?: BenchmarkTone;
  note?: React.ReactNode;
}

const clamp = (value: number) => `${Math.max(0, Math.min(100, value))}%`;
const tones: Record<BenchmarkTone, string> = {
  emphasis: 'var(--sc-chart-emphasis)',
  good: 'var(--sc-good)',
  caution: 'var(--sc-warn)',
  danger: 'var(--sc-danger)',
  info: 'var(--sc-info)',
};

/**
 * An exact value located against a caller-authored scale. The visible label,
 * value, scale and note carry the meaning; the proportional track is decorative.
 */
export const Benchmark = React.forwardRef<HTMLElement, BenchmarkProps>(function Benchmark(
  { label, value, position, scale, reference, band, tone = 'emphasis', note, className, style, ...rest }, ref,
) {
  const custom = {
    '--sc-benchmark-position': clamp(position),
    '--sc-benchmark-tone': tones[tone],
    ...(reference == null ? {} : { '--sc-benchmark-reference': clamp(reference) }),
    ...(band == null ? {} : {
      '--sc-benchmark-band-start': clamp(Math.min(band.start, band.end)),
      '--sc-benchmark-band-end': clamp(Math.max(band.start, band.end)),
    }),
  } as React.CSSProperties;

  return <figure ref={ref} className={cx('sc-benchmark', className)} style={{ ...custom, ...style }} {...rest}>
    <figcaption className="sc-benchmark__head">
      <span className="sc-benchmark__label">{label}</span>
      <strong className="sc-benchmark__value">{value}</strong>
    </figcaption>
    <div className="sc-benchmark__track" aria-hidden="true">
      {band != null && <span className="sc-benchmark__band" />}
      {reference != null && <span className="sc-benchmark__reference" />}
      <span className="sc-benchmark__point" />
    </div>
    <div className="sc-benchmark__scale" aria-hidden="true">
      {scale.map((item, index) => <span key={index}>{item}</span>)}
    </div>
    {note != null && <p className="sc-benchmark__note">{note}</p>}
  </figure>;
});
