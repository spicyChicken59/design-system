import * as React from 'react';
import { cx } from './cx.js';

export interface TabItem {
  /** Stable id passed back to `onChange`. */
  id: string;
  /** Visible label — lowercase mono unless `keepCase` is set. */
  label: React.ReactNode;
  /** Keep the label's own casing for proper nouns (BMW i5, Q3). */
  keepCase?: boolean;
}

export interface TabsProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** The tabs, in order. */
  items: TabItem[];
  /** Id of the selected tab. */
  value: string;
  /** Fires with the newly selected tab's id. */
  onChange?: (id: string) => void;
  /** Accessible name for the group — what is being switched ("Measure", "Model"). Required: an unnamed group is unusable by screen readers. */
  label: string;
}

/**
 * A pill row for switching the *subject* of a view — which series, which
 * quarter, which car. It is a segmented control (`role="group"` with
 * `aria-pressed` buttons), not a WAI-ARIA tab set: there are no panels to
 * control. It is not page navigation either; that belongs in `Nav`.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { items, value, onChange, label, className, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx('sc-tabs', className)} role="group" aria-label={label} {...rest}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={item.id === value}
          className={cx('sc-tab', item.keepCase && 'sc-tab--case')}
          onClick={() => onChange?.(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});
Tabs.displayName = 'Tabs';
