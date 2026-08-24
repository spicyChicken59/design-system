import * as React from 'react';
import { Grid, Tile } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;
const cell = (label: string, value: string) => <Tile key={label} label={label} value={value} />;

/** Two columns — the widest cells, for cards with body copy. */
export const Two = () => (
  <div style={page}>
    <Grid cols={2}>{[cell('Vehicles', '1,284'), cell('Depots', '12')]}</Grid>
  </div>
);

/** Three columns — the dashboard default. */
export const Three = () => (
  <div style={page}>
    <Grid cols={3}>{[cell('Vehicles', '1,284'), cell('Utilisation', '78%'), cell('Cost / mile', '£0.41')]}</Grid>
  </div>
);

/** Four columns — the densest row, for short figures only. */
export const Four = () => (
  <div style={page}>
    <Grid cols={4}>
      {[cell('Vehicles', '1,284'), cell('Depots', '12'), cell('Utilisation', '78%'), cell('Cost', '£0.41')]}
    </Grid>
  </div>
);
