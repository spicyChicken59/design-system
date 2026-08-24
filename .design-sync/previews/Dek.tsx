import * as React from 'react';
import { Dek, Eyebrow } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The standfirst in position: eyebrow, h1, one-sentence dek. */
export const InATitleBlock = () => (
  <div style={page}>
    <Eyebrow>depots · august</Eyebrow>
    <h1>Four depots now run below the cost-per-mile target.</h1>
    <Dek>
      Electric vans took over the city routes in June, and the saving shows up first
      where the routes are shortest.
    </Dek>
  </div>
);
