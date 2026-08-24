import * as React from 'react';
import { Table } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

const columns = [
  { key: 'depot', header: 'depot' },
  { key: 'vehicles', header: 'vehicles', numeric: true },
  { key: 'utilisation', header: 'utilisation', numeric: true, sortable: true, sorted: true },
  { key: 'cost', header: 'cost / mile', numeric: true },
];

const rows = [
  { depot: 'Manchester', vehicles: '184', utilisation: '82%', cost: '£0.38' },
  { depot: 'Birmingham', vehicles: '141', utilisation: '79%', cost: '£0.41' },
  { depot: 'Leeds', vehicles: '96', utilisation: '74%', cost: '£0.44' },
  { depot: 'Glasgow', vehicles: '78', utilisation: '71%', cost: '£0.47' },
];

/** The standard table: mono header over the cobalt rule, numbers right and tabular. */
export const Standard = () => (
  <div style={page}>
    <Table columns={columns} rows={rows} caption="Fleet utilisation by depot" />
  </div>
);

/** Compact padding for dense data. */
export const Compact = () => (
  <div style={page}>
    <Table columns={columns} rows={rows} compact caption="Fleet utilisation by depot" />
  </div>
);

/** Inside a horizontal scroller — the header sticks while rows scroll. */
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
