import * as React from 'react';
import { cx } from './cx';

export interface LegendItem {
  /** Series name. */
  label: React.ReactNode;
  /** The series colour — a `--sc-chart-*` token, never a status colour. */
  color: string;
  /** Draw a square swatch (bars, areas) instead of the default line key. */
  swatch?: boolean;
}

export interface LegendProps extends React.ComponentPropsWithoutRef<'div'> {
  /** The series, in the same fixed order the chart uses. */
  items: LegendItem[];
}

/**
 * The chart key. Required whenever a chart carries two or more series.
 * Line charts get line keys; bars and areas get square swatches.
 */
export function Legend({ items, className, ...rest }: LegendProps) {
  return (
    <div className={cx('sc-legend', className)} {...rest}>
      {items.map((item, i) => (
        <span key={i}>
          <i className={cx(item.swatch && 'is-swatch')} style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
