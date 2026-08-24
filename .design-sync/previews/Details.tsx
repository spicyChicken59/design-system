import * as React from 'react';
import { Details, Table } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

const columns = [
  { key: 'depot', header: 'depot' },
  { key: 'utilisation', header: 'utilisation', numeric: true },
];
const rows = [
  { depot: 'Manchester', utilisation: '82%' },
  { depot: 'Birmingham', utilisation: '79%' },
  { depot: 'Leeds', utilisation: '74%' },
];

/** Open — the table twin the system requires under every chart. */
export const TableTwinOpen = () => (
  <div style={page}>
    <Details summary="show the numbers" open>
      <Table columns={columns} rows={rows} compact caption="Utilisation by depot" />
    </Details>
  </div>
);

/** Closed, which is how it sits under a chart until asked for. */
export const Closed = () => (
  <div style={page}>
    <Details summary="show the numbers">
      <Table columns={columns} rows={rows} compact caption="Utilisation by depot" />
    </Details>
  </div>
);
