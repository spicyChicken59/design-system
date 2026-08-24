import * as React from 'react';
import { Callout, Card, Stack } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** Blocks stacked on the system's 16px rhythm, with nothing above the first. */
export const Default = () => (
  <div style={page}>
    <Stack>
      <Card title="First" headingLevel={3} hint="Nothing sits above this one." />
      <Callout variant="core" label="between">
        <p>Stack spaces whatever you put in it, whatever type it is.</p>
      </Callout>
      <Card title="Third" headingLevel={3} hint="Same 16px gap above." />
    </Stack>
  </div>
);
