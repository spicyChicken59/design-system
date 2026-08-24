import * as React from 'react';
import { Delta, Grid, Tile } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** A single tile with every slot filled. */
export const Default = () => (
  <div style={page}>
    <Tile
      label="Vehicles on the road"
      value="1,284"
      sub="of 1,638 active"
      delta={<Delta tone="good" arrow="up">3% vs last week</Delta>}
    />
  </div>
);

/** The dashboard row this component exists for. */
export const Row = () => (
  <div style={page}>
    <Grid cols={3}>
      <Tile
        label="Vehicles on the road"
        value="1,284"
        sub="of 1,638 active"
        delta={<Delta tone="good" arrow="up">3% vs last week</Delta>}
      />
      <Tile
        label="Cost per mile"
        value="£0.41"
        sub="fleet average"
        delta={<Delta tone="good" arrow="down">4p vs last week</Delta>}
      />
      <Tile
        label="Depots off target"
        value="2 of 12"
        small
        sub="Leeds, Glasgow"
        delta={<Delta tone="bad" arrow="up">1 vs last week</Delta>}
      />
    </Grid>
  </div>
);

/** The small value variant, for figures that are words rather than numbers. */
export const SmallValue = () => (
  <div style={page}>
    <Tile label="Status" value="12 open" small sub="oldest raised 6 days ago" />
  </div>
);
