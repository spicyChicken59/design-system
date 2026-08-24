import * as React from 'react';
import { Meta } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The provenance row: what a reader needs to trust the page. */
export const Default = () => (
  <div style={page}>
    <Meta items={['Updated 24 Aug 2026', 'Source: telematics export', 'Method: vehicle-days']} />
  </div>
);

/** Two facts is enough when the page is short. */
export const Short = () => (
  <div style={page}>
    <Meta items={['Updated today', 'Source: fleet ops']} />
  </div>
);
