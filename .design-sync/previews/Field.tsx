import * as React from 'react';
import { Field, Input, Row, Select } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** A field wrapping each of the controls it is designed for. */
export const WithControls = () => (
  <div style={page}>
    <Row>
      <Field label="depot">
        <Select defaultValue="mcr">
          <option value="mcr">Manchester</option>
          <option value="lds">Leeds</option>
        </Select>
      </Field>
      <Field label="search">
        <Input placeholder="Registration…" />
      </Field>
    </Row>
  </div>
);
