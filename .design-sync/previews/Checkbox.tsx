import * as React from 'react';
import { Checkbox, Row } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;
// .sc-check is inline-flex, so a vertical list needs an explicit flex column —
// Stack's margin-top does not separate inline-level children.
const column = { ...page, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' } as const;

/** Checked, unchecked and disabled. The box takes the spice accent when checked. */
export const States = () => (
  <div style={column}>
    <Checkbox label="Include workshop time" defaultChecked />
    <Checkbox label="Exclude provisional depots" />
    <Checkbox label="Locked by policy" disabled />
  </div>
);

/** Inline, the way a filter row uses them. */
export const InARow = () => (
  <div style={page}>
    <Row>
      <Checkbox label="Electric only" defaultChecked />
      <Checkbox label="Exclude workshop" />
    </Row>
  </div>
);
