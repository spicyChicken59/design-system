import * as React from 'react';
import { Callout, Stack } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The core takeaway — one per section, and the most common form. */
export const Core = () => (
  <div style={page}>
    <Callout variant="core" label="core takeaway">
      <p>Utilisation is up because the fleet is working harder, not because it shrank.</p>
    </Callout>
  </div>
);

/** All four variants in the order you would reach for them. */
export const Variants = () => (
  <div style={page}>
    <Stack>
      <Callout variant="core" label="core takeaway">
        <p>The single thing a reader should leave with.</p>
      </Callout>
      <Callout variant="ink" label="remember">
        <p>Ink stays dark in both themes — use it for what must survive a skim.</p>
      </Callout>
      <Callout variant="spice" label="next">
        <p>The one next action. Exactly one per view.</p>
      </Callout>
      <Callout variant="warning" label="check this">
        <p>The Leeds figures are provisional until the depot closes its month.</p>
      </Callout>
    </Stack>
  </div>
);

/** Without a label, when the surrounding section already says what it is. */
export const Unlabelled = () => (
  <div style={page}>
    <Callout variant="core">
      <p>A callout carries one idea, and the file-fold corner marks it as the family's.</p>
    </Callout>
  </div>
);
