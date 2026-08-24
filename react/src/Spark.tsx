import * as React from 'react';
import { cx } from './cx.js';

export interface SparkProps extends Omit<React.ComponentPropsWithoutRef<'svg'>, 'width' | 'height' | 'viewBox' | 'children' | 'values'> {
  /** The series, oldest first. Two or more points draw a line; one draws just the end dot. Non-finite entries are skipped. */
  values: number[];
  /** Drawn width in px. */
  width?: number;
  /** Drawn height in px. */
  height?: number;
  /** Stroke in the emphasis colour (the series that matters) instead of context grey. */
  emphasis?: boolean;
  /** Adds `sc-tile__spark` — the block-level spacing for a sparkline inside a `Tile`. */
  inTile?: boolean;
}

const PAD = 3;
const DOT = 2.5;

function points(raw: number[], width: number, height: number): Array<[number, number]> {
  const values = raw.filter((v) => Number.isFinite(v));
  const n = values.length;
  if (n === 0) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min;
  const w = width - PAD * 2;
  const h = height - PAD * 2;
  return values.map((v, i) => {
    const x = n === 1 ? width / 2 : PAD + (i / (n - 1)) * w;
    const y = span === 0 ? height / 2 : PAD + (1 - (v - min) / span) * h;
    return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
  });
}

/**
 * A sparkline: one thin line in the context (or emphasis) chart colour with a
 * surface-ringed dot on the latest point. Decorative — `aria-hidden` — so the
 * number it accompanies (a tile value, a table cell) must say the trend in
 * words or the row's `Details` must hold the series.
 */
export const Spark = React.forwardRef<SVGSVGElement, SparkProps>(function Spark(
  { values, width = 80, height = 26, emphasis = false, inTile = false, className, ...rest },
  ref,
) {
  const pts = points(values, width, height);
  const d = pts.length >= 2 ? pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ') : undefined;
  const last = pts.length > 0 ? pts[pts.length - 1] : undefined;
  return (
    <svg
      ref={ref}
      className={cx('sc-spark', emphasis && 'sc-spark--emphasis', inTile && 'sc-tile__spark', className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {d ? <path d={d} /> : null}
      {last ? <circle cx={last[0]} cy={last[1]} r={DOT} /> : null}
    </svg>
  );
});
Spark.displayName = 'Spark';
