import * as React from 'react';
import { Legend } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Line keys, for line charts. Colours come from the --sc-chart-* slots in order. */
export const LineKeys = () => (
  <div style={page}>
    <Legend
      items={[
        { label: 'Manchester', color: 'var(--sc-chart-1)' },
        { label: 'Birmingham', color: 'var(--sc-chart-2)' },
        { label: 'Leeds', color: 'var(--sc-chart-3)' },
      ]}
    />
  </div>
);

/** Square swatches, for bars and areas. */
export const Swatches = () => (
  <div style={page}>
    <Legend
      items={[
        { label: 'Diesel', color: 'var(--sc-chart-1)', swatch: true },
        { label: 'Electric', color: 'var(--sc-chart-2)', swatch: true },
        { label: 'Other', color: 'var(--sc-chart-other)', swatch: true },
      ]}
    />
  </div>
);

/** The emphasis pattern: the series that matters in colour, the rest in context grey. */
export const Emphasis = () => (
  <div style={page}>
    <Legend
      items={[
        { label: 'Manchester', color: 'var(--sc-chart-emphasis)' },
        { label: 'All other depots', color: 'var(--sc-chart-context)' },
      ]}
    />
  </div>
);
