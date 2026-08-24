import * as React from 'react';
import { cx } from './cx';

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
  /** Accessible name for the tab row. */
  label?: string;
}

/**
 * A pill row for switching the *subject* of a view — which series, which
 * quarter, which car. It is not page navigation; that belongs in `Nav`.
 */
export function Tabs({ items, value, onChange, label, className, ...rest }: TabsProps) {
  return (
    <div className={cx('sc-tabs', className)} role="tablist" aria-label={label} {...rest}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          className={cx('sc-tab', item.keepCase && 'sc-tab--case')}
          onClick={() => onChange?.(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
