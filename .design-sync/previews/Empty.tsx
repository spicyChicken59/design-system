import * as React from 'react';
import { Card, Empty } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Nothing to show yet: one sentence, no apology, no graphic. */
export const Default = () => (
  <div style={page}>
    <Card title="Utilisation by week" hint="Manchester against the fleet.">
      <Empty>No weeks recorded yet. The first chart appears after tomorrow's export.</Empty>
    </Card>
  </div>
);

/** In a table body: `as="row"` renders a spanning, centred cell. */
export const TableRow = () => (
  <div style={page}>
    <table className="sc-table">
      <caption className="sc-sr-only">Vehicles for sale</caption>
      <thead>
        <tr>
          <th scope="col">vehicle</th>
          <th scope="col">depot</th>
          <th scope="col" className="sc-num">price</th>
        </tr>
      </thead>
      <tbody>
        <Empty as="row" colSpan={3}>
          No vehicles matched. Widen the radius or clear a filter.
        </Empty>
      </tbody>
    </table>
  </div>
);
