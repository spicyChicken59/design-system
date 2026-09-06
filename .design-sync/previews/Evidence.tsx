import * as React from 'react';
import { Evidence, Table } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Authored design guidance supplies the evidence; no product metrics are invented. */
export const WithSource = () => <div style={page}>
  <Evidence source={<span>Source: SpicyChicken visual recipes · brand placement guidance</span>}>
    <Table research caption="Where to place the SpicyChicken identity" columns={[
      { key: 'element', header: 'element' },
      { key: 'placement', header: 'placement' },
    ]} rows={[
      { id: 'mark', element: 'Original mark', placement: 'A dedicated art region with clear space.' },
      { id: 'signature', element: 'Maker’s signature', placement: 'Beside the source, outside the chart plot.' },
    ]} />
  </Evidence>
</div>;
