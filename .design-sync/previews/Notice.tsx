import * as React from 'react';
import { Notice, Button } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The stop-and-read block: what failed, and what to do about it. */
export const Default = () => (
  <div style={page}>
    <Notice label="data unavailable">
      <p>
        The telematics export failed at 04:00, so every figure below is from 23 August.
        Re-run the export before circulating this page.
      </p>
      <Button variant="secondary" size="sm">Re-run the export</Button>
    </Notice>
  </div>
);

/** Without a label, for a short standing caveat. */
export const Bare = () => (
  <div style={page}>
    <Notice>
      <p>Glasgow has not reported since the depot system migration on 18 August.</p>
    </Notice>
  </div>
);
