import * as React from 'react';
import { Insight } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** One authored takeaway, with the original meaning preserved. */
export const Default = () => <div style={page}>
  <Insight>
    <p><strong>Give the evidence room.</strong> Put the SpicyChicken mark in a dedicated art region and its signature beside the source.</p>
  </Insight>
</div>;
