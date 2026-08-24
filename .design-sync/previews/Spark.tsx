import * as React from 'react';
import { Delta, Grid, Row, Spark, Table, Tile } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

const week = [71, 73, 72, 75, 76, 78, 78];
const falling = [0.47, 0.46, 0.46, 0.44, 0.43, 0.42, 0.41];

/** Context grey by default; `emphasis` for the series that matters. */
export const Forms = () => (
  <div style={page}>
    <Row>
      <Spark values={week} />
      <Spark values={week} emphasis />
      <Spark values={falling} width={120} height={32} emphasis />
    </Row>
  </div>
);

/** Inside a tile, under the context line — `inTile` adds the block spacing. */
export const InATile = () => (
  <div style={page}>
    <Grid cols={3}>
      <Tile
        label="Utilisation"
        value="78%"
        sub="rolling 7 days"
        spark={<Spark values={week} emphasis inTile />}
        delta={<Delta tone="good" arrow="up">3% vs last week</Delta>}
      />
      <Tile
        label="Cost per mile"
        value="£0.41"
        sub="fleet average"
        spark={<Spark values={falling} inTile />}
        delta={<Delta tone="good" arrow="down">4p vs last week</Delta>}
      />
    </Grid>
  </div>
);

/** A trend column in a table: the same line, context grey, one per row. */
export const InATable = () => (
  <div style={page}>
    <Table
      columns={[
        { key: 'depot', header: 'depot' },
        { key: 'trend', header: 'trend, 7 days' },
        { key: 'utilisation', header: 'utilisation', numeric: true },
      ]}
      rows={[
        { id: 'mcr', depot: 'Manchester', trend: <Spark values={[74, 78, 77, 81, 82, 82, 82]} emphasis />, utilisation: '82%' },
        { id: 'bhx', depot: 'Birmingham', trend: <Spark values={[70, 72, 75, 77, 79, 78, 79]} />, utilisation: '79%' },
        { id: 'lds', depot: 'Leeds', trend: <Spark values={[76, 75, 75, 74, 74, 73, 74]} />, utilisation: '74%' },
      ]}
      caption="Utilisation trend by depot"
    />
  </div>
);
