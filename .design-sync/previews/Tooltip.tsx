import * as React from 'react';
import { Tooltip } from '@spicychicken/react';

// The tooltip is absolutely positioned and hidden until `open`, so a truthful
// preview places it inside a relative container in its open state.
const chart = { background: 'var(--sc-bg)', padding: 24, position: 'relative', height: 150 } as const;

/** The multi-series form a line chart's crosshair shows: values lead, labels follow. */
export const MultiSeries = () => (
  <div style={chart}>
    <Tooltip
      open
      style={{ position: 'absolute', top: 24, left: 24 }}
      date="18 aug 2026"
      rows={[
        { color: 'var(--sc-chart-1)', label: 'Manchester', value: '82%' },
        { color: 'var(--sc-chart-2)', label: 'Birmingham', value: '79%' },
        { color: 'var(--sc-chart-3)', label: 'Leeds', value: '74%' },
      ]}
      meta="Utilisation, rolling 7 days"
    />
  </div>
);

/** The single-series form a bar chart shows per mark. */
export const SingleSeries = () => (
  <div style={chart}>
    <Tooltip
      open
      style={{ position: 'absolute', top: 24, left: 24 }}
      date="manchester"
      rows={[{ color: 'var(--sc-chart-1)', label: 'Vehicles on the road', value: '184' }]}
    />
  </div>
);
