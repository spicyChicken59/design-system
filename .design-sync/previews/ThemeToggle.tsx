import * as React from 'react';
import { ThemeToggle } from '@spicychicken/react';

const ink = { background: 'var(--sc-ink)', padding: 16 } as const;

/**
 * The three-way theme control, on the ink surface it lives on. It writes
 * `data-theme` to the document and remembers the choice per browser.
 */
export const Default = () => (
  <div style={ink}>
    <ThemeToggle />
  </div>
);
