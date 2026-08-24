import * as React from 'react';
import { Empty, Table, type SortDirection, type TableColumn } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

const columns: TableColumn[] = [
  { key: 'depot', header: 'depot' },
  { key: 'vehicles', header: 'vehicles', numeric: true },
  { key: 'utilisation', header: 'utilisation', numeric: true, sortable: true, sort: 'descending' },
  { key: 'cost', header: 'cost / mile', numeric: true },
];

const rows = [
  { id: 'mcr', depot: 'Manchester', vehicles: '184', utilisation: '82%', cost: '£0.38' },
  { id: 'bhx', depot: 'Birmingham', vehicles: '141', utilisation: '79%', cost: '£0.41' },
  { id: 'lds', depot: 'Leeds', vehicles: '96', utilisation: '74%', cost: '£0.44' },
  { id: 'gla', depot: 'Glasgow', vehicles: '78', utilisation: '71%', cost: '£0.47' },
];

/** The standard table: mono header over the cobalt rule, numbers right and tabular. */
export const Standard = () => (
  <div style={page}>
    <Table columns={columns} rows={rows} caption="Fleet utilisation by depot" />
  </div>
);

/**
 * Sortable columns: with `onSort` the heading becomes a keyboard-reachable
 * button and `sort` announces the direction through `aria-sort`, which draws ↑ / ↓.
 * Sorting the rows stays the caller's job.
 */
export const Sortable = () => {
  const [key, setKey] = React.useState('utilisation');
  const [dir, setDir] = React.useState<SortDirection>('descending');
  const onSort = (next: string) => {
    if (next === key) setDir(dir === 'ascending' ? 'descending' : 'ascending');
    else {
      setKey(next);
      setDir('ascending');
    }
  };
  const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
  const sorted = [...rows].sort((a, b) => {
    const av = a[key as keyof typeof a];
    const bv = b[key as keyof typeof b];
    const cmp = key === 'depot' ? av.localeCompare(bv) : num(av) - num(bv);
    return dir === 'ascending' ? cmp : -cmp;
  });
  return (
    <div style={page}>
      <Table
        columns={columns.map((c) => ({ ...c, sortable: true, sort: c.key === key ? dir : undefined }))}
        rows={sorted}
        onSort={onSort}
        caption="Fleet utilisation by depot"
      />
    </div>
  );
};

/** Compact padding for dense data. */
export const Compact = () => (
  <div style={page}>
    <Table columns={columns} rows={rows} compact caption="Fleet utilisation by depot" />
  </div>
);

/** Inside a horizontal scroller, for a table wider than its card. */
export const Scrollable = () => (
  <div style={page}>
    <Table
      columns={[...columns, { key: 'driver', header: 'lead driver' }, { key: 'updated', header: 'updated' }]}
      rows={rows.map((r) => ({ ...r, driver: 'A. Whitfield', updated: '24 Aug 2026' }))}
      scroll
      caption="Fleet utilisation by depot"
    />
  </div>
);

/** `scroll="tall"` bounds the height to 70vh and the header sticks while rows scroll. */
export const TallScroller = () => (
  <div style={page}>
    <Table
      columns={columns}
      rows={Array.from({ length: 12 }, (_, i) => ({ ...rows[i % rows.length], id: `r${i}` }))}
      scroll="tall"
      caption="Fleet utilisation by depot, every depot"
    />
  </div>
);

/** Nothing to show yet: one sentence in a spanning row, no apology. */
export const NoRows = () => (
  <div style={page}>
    <table className="sc-table">
      <caption className="sc-sr-only">Fleet utilisation by depot</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col" className={c.numeric ? 'sc-num' : undefined}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <Empty as="row" colSpan={columns.length}>
          No depots reported today. The next export runs at 04:00.
        </Empty>
      </tbody>
    </table>
  </div>
);
