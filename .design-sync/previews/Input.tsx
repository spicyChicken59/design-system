import * as React from 'react';
import { Field, Input, Row } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** With a value, and with a placeholder. */
export const Default = () => (
  <div style={page}>
    <Row>
      <Input defaultValue="Manchester" aria-label="Depot" />
      <Input placeholder="Search depots…" aria-label="Search" />
    </Row>
  </div>
);

/** Labelled, which is how it should normally appear. */
export const Labelled = () => (
  <div style={page}>
    <Field label="depot">
      <Input defaultValue="Manchester" />
    </Field>
  </div>
);

/** Disabled and read-only states. */
export const States = () => (
  <div style={page}>
    <Row>
      <Input defaultValue="Locked value" disabled aria-label="Disabled" />
      <Input defaultValue="Read only" readOnly aria-label="Read only" />
    </Row>
  </div>
);
