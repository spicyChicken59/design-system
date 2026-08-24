import * as React from 'react';
import { cx } from './cx.js';

export type SortDirection = 'ascending' | 'descending';

export interface TableColumn {
  /** Key into each row object. */
  key: string;
  /** Column heading — lowercase mono over the cobalt rule. */
  header: React.ReactNode;
  /** Right-align, tabular figures, no wrapping. Set it on every numeric column. */
  numeric?: boolean;
  /**
   * Make the header operable: with `Table onSort` the heading renders inside a
   * `button.sc-table__sort`, keyboard-reachable. Sorting the rows stays the
   * caller's job.
   */
  sortable?: boolean;
  /** The direction this column is currently sorted in — sets `aria-sort` on the `th`, which draws ↑ / ↓. */
  sort?: SortDirection;
  /** @deprecated 2.1 — use `sort: 'descending'`. Removed in 3.0. */
  sorted?: boolean;
}

export interface TableProps extends React.ComponentPropsWithoutRef<'table'> {
  /** Column definitions, in display order. */
  columns: TableColumn[];
  /** Row data, keyed by `TableColumn.key`. */
  rows: Array<Record<string, React.ReactNode>>;
  /**
   * Stable identity for each row. Defaults to `row.id` when it is a string or
   * number, else the index — pass one whenever rows can be re-sorted or
   * filtered, or stateful cells keep the wrong row's state.
   */
  rowKey?: (row: Record<string, React.ReactNode>, index: number) => React.Key;
  /** Fires with the column key when a `sortable` header is activated. */
  onSort?: (key: string) => void;
  /** Tighter padding and 13px text for dense data. */
  compact?: boolean;
  /**
   * Wrap in a `.sc-table-scroll` horizontal scroller. `'tall'` bounds it to 70vh
   * with a vertical scroll and a header that sticks.
   */
  scroll?: boolean | 'tall';
  /** Caption for assistive tech. Rendered visually hidden. */
  caption?: string;
  /** What to say when there are no rows — rendered as the `tr.sc-empty` state spanning every column. */
  empty?: React.ReactNode;
}

function defaultKey(row: Record<string, React.ReactNode>, index: number): React.Key {
  const id = row.id;
  return typeof id === 'string' || typeof id === 'number' ? id : index;
}

/**
 * The data table: an open lowercase-mono header over a 2px cobalt rule,
 * hairline rows, no zebra striping, and row hover. Numbers go right and
 * tabular via `numeric` — never centre a column. Sort state is announced
 * through `aria-sort` and drawn by the stylesheet.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { columns, rows, rowKey = defaultKey, onSort, compact = false, scroll = false, caption, empty, className, ...rest },
  ref,
) {
  const table = (
    <table ref={ref} className={cx('sc-table', compact && 'sc-table--compact', className)} {...rest}>
      {caption ? <caption className="sc-sr-only">{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((col) => {
            const sort = col.sort ?? (col.sorted ? 'descending' : undefined);
            const operable = Boolean(col.sortable && onSort);
            return (
              <th
                key={col.key}
                scope="col"
                className={cx(col.numeric && 'sc-num', operable && 'is-sortable')}
                aria-sort={sort}
              >
                {operable ? (
                  <button type="button" className="sc-table__sort" onClick={() => onSort?.(col.key)}>
                    {col.header}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && empty != null ? (
          <tr className="sc-empty">
            <td colSpan={columns.length}>{empty}</td>
          </tr>
        ) : null}
        {rows.map((row, i) => (
          <tr key={rowKey(row, i)}>
            {columns.map((col) => (
              <td key={col.key} className={cx(col.numeric && 'sc-num')}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  if (!scroll) return table;
  return <div className={cx('sc-table-scroll', scroll === 'tall' && 'sc-table-scroll--tall')}>{table}</div>;
});
Table.displayName = 'Table';
