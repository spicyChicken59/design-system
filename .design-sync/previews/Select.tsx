import * as React from 'react';
import { Field, Row, Select } from '@spicychicken/react';

const page = { background: 'var(--sc-bg)', padding: 24 } as const;

/** The select with the system's own chevron, drawn in CSS. */
export const Default = () => (
  <div style={page}>
    <Select defaultValue="30" aria-label="Period">
      <option value="7">Last 7 days</option>
      <option value="30">Last 30 days</option>
      <option value="90">Last quarter</option>
    </Select>
  </div>
);

/** Labelled, in the filter-row form. */
export const Labelled = () => (
  <div style={page}>
    <Row>
      <Field label="period">
        <Select defaultValue="30">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </Select>
      </Field>
      <Field label="depot">
        <Select defaultValue="all">
          <option value="all">All depots</option>
          <option value="mcr">Manchester</option>
        </Select>
      </Field>
    </Row>
  </div>
);
