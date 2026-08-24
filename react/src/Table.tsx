import * as React from 'react';
import { cx } from './cx';

export interface TableColumn {
  /** Key into each row object. */
  key: string;
  /** Column heading — lowercase mono over the cobalt rule. */
  header: React.ReactNode;
  /** Right-align and use tabular figures. Set it on every numeric column. */
  numeric?: boolean;
  /** Mark the header clickable. Sorting itself stays the caller's job. */
  sortable?: boolean;
  /** Mark this column as the one currently sorted — draws the ↓ affordance. */
  sorted?: boolean;
}

export interface TableProps extends React.ComponentPropsWithoutRef<'table'> {
  /** Column definitions, in display order. */
  columns: TableColumn[];
  /** Row data, keyed by `TableColumn.key`. */
  rows: Array<Record<string, React.ReactNode>>;
  /** Tighter padding and 13px text for dense data. */
  compact?: boolean;
  /** Wrap in a horizontal scroller — the header then sticks while rows scroll. */
  scroll?: boolean;
  /** Caption for assistive tech. Rendered visually hidden. */
  caption?: string;
}

/**
 * The data table: an open lowercase-mono header over a 2px cobalt rule,
 * hairline rows, no zebra striping, and row hover. Numbers go right and
 * tabular via `numeric` — never centre a column.
 */
export function Table({
  columns,
  rows,
  compact = false,
  scroll = false,
  caption,
  className,
  ...rest
}: TableProps) {
  const table = (
    <table className={cx('sc-table', compact && 'sc-table--compact', className)} {...rest}>
      {caption ? <caption className="sc-sr-only">{caption}</caption> : null}
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              scope="col"
              className={cx(
                col.numeric && 'sc-num',
                col.sortable && 'is-sortable',
                col.sorted && 'is-sorted',
              )}
              aria-sort={col.sorted ? 'descending' : undefined}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
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
  return scroll ? <div className="sc-table-scroll">{table}</div> : table;
}
