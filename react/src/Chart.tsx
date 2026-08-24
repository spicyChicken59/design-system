import * as React from 'react';
import { cx } from './cx.js';

export interface ChartProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'aria-label'> {
  /**
   * The accessible name of the chart — what it shows, in a sentence
   * ("Landed price by day, last 30 days"). Required: the SVG itself is hidden
   * from assistive tech and the `Details` table twin carries the numbers.
   */
  label: string;
}

/**
 * The chart host: a focusable, named group (`role="group" tabindex="0"`) that
 * sizes its SVG to the container and draws the system focus ring. Children are
 * the `<svg aria-hidden="true">` — classed with `sc-chart__grid`, `__crosshair`,
 * `__series`, `__series--emphasis|--context`, `__marker`, `__label` — an
 * optional `Tooltip`, and the `Details` table twin below. The ref reaches the
 * host for crosshair and tooltip positioning.
 */
export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(function Chart(
  { label, className, tabIndex = 0, ...rest },
  ref,
) {
  return <div ref={ref} className={cx('sc-chart', className)} role="group" tabIndex={tabIndex} aria-label={label} {...rest} />;
});
Chart.displayName = 'Chart';
