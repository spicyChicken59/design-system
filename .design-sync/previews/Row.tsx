import * as React from 'react';
import { Button, Chip, Row } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** A run of chips on one baseline. */
export const Chips = () => (
  <div style={page}>
    <Row>
      <Chip tone="good">on target</Chip>
      <Chip tone="warn">watch</Chip>
      <Chip tone="neutral">12 depots</Chip>
    </Row>
  </div>
);

/** Mixed content — the row aligns everything on its centre and wraps when it must. */
export const Mixed = () => (
  <div style={page}>
    <Row>
      <span>Manchester depot</span>
      <Chip tone="good">on target</Chip>
      <Button variant="secondary" size="sm">Open</Button>
    </Row>
  </div>
);
