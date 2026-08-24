import * as React from 'react';
import { Nav } from '@spicychicken/react';

const ink = { background: 'var(--sc-ink)', padding: 16 } as const;

/** Primary navigation with the current page carrying the spice underline. */
export const Default = () => (
  <div style={ink}>
    <Nav
      items={[
        { href: '#overview', label: 'Overview', current: true },
        { href: '#depots', label: 'Depots' },
        { href: '#costs', label: 'Costs' },
        { href: '#method', label: 'Method' },
      ]}
    />
  </div>
);
