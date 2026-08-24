import * as React from 'react';
import { Watermark } from '@spicychicken/react';

const ink = { background: 'var(--sc-ink)', padding: 20 } as const;

/** The brand endorsement as it sits in a footer — always this, always here. */
export const Default = () => (
  <div style={ink}>
    <Watermark />
  </div>
);
